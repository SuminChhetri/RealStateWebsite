'use server';

import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { evaluations, mistakes, reviewCards, writingSubmissions, writingTasks } from '@/lib/db/schema';
import { newId } from '@/lib/ids';
import { audit, rateLimit, requireSession } from '@/lib/auth/guard';
import { evaluateWriting } from '@/lib/engines/writing-eval';
import { newCard, nowSeconds, review } from '@/lib/engines/srs';

const schema = z.object({
  taskSlug: z.string().min(1).max(80),
  text: z.string().min(1, 'Write something before submitting.').max(20000),
  planNotes: z.string().max(4000).optional(),
  elapsedSeconds: z.coerce.number().int().min(0).max(7200),
  timed: z.union([z.literal('on'), z.literal('true'), z.literal('')]).optional(),
  revisionCount: z.coerce.number().int().min(0).max(10000).default(0),
});

export async function submitWriting(formData: FormData) {
  const session = await requireSession();
  const parsed = schema.safeParse({
    taskSlug: formData.get('taskSlug'),
    text: formData.get('text'),
    planNotes: formData.get('planNotes') ?? undefined,
    elapsedSeconds: formData.get('elapsedSeconds') ?? 0,
    timed: formData.get('timed') ?? '',
    revisionCount: formData.get('revisionCount') ?? 0,
  });
  if (!parsed.success) redirect('/writing?error=invalid');

  // Evaluation is the expensive path in this product, so it is the one that
  // carries a limit.
  const limit = await rateLimit(`writing:${session.userId}`, 40, 3600);
  if (!limit.ok) redirect('/writing?error=rate-limited');

  const task = (await db.select().from(writingTasks).where(eq(writingTasks.slug, parsed.data.taskSlug)).limit(1))[0];
  if (!task) redirect('/writing?error=not-found');

  const text = parsed.data.text.replace(/\r\n/g, '\n').trim();
  const wordCount = (text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).length;

  const evaluation = evaluateWriting({
    task: {
      taskType: task.taskType,
      title: task.title,
      scenario: task.scenario,
      instructions: task.instructions,
      requirements: JSON.parse(task.requirements) as string[],
      choices: task.choices ? (JSON.parse(task.choices) as string[]) : null,
      minWords: task.minWords,
      maxWords: task.maxWords,
      register: task.register,
      timeLimitSeconds: task.timeLimitSeconds,
    },
    text,
    elapsedSeconds: parsed.data.elapsedSeconds,
    timed: !!parsed.data.timed,
  });

  const submissionId = newId('wsb');
  const evaluationId = newId('evl');
  const now = nowSeconds();

  await db.transaction(async (tx) => {
    await tx.insert(writingSubmissions)
      .values({
        id: submissionId,
        userId: session.userId,
        orgId: session.orgId,
        taskId: task.id,
        text,
        wordCount,
        planNotes: parsed.data.planNotes ?? null,
        elapsedSeconds: parsed.data.elapsedSeconds,
        timed: !!parsed.data.timed,
        revisionCount: parsed.data.revisionCount,
      })
      ;

    await tx.insert(evaluations)
      .values({
        id: evaluationId,
        userId: session.userId,
        orgId: session.orgId,
        submissionType: 'writing',
        submissionId,
        engine: evaluation.engine,
        engineVersion: evaluation.engineVersion,
        dimensions: JSON.stringify(evaluation.dimensions),
        estimatedLevel: evaluation.estimatedLevel,
        levelSe: evaluation.levelSe,
        findings: JSON.stringify({
          usage: evaluation.findings,
          requirementCoverage: evaluation.requirementCoverage,
          metrics: evaluation.metrics,
        }),
        coaching: JSON.stringify(evaluation.coaching),
        limitations: JSON.stringify(evaluation.limitations),
      })
      ;

    // Usage patterns found here become mistakes and scheduled retrieval, which
    // is what makes writing feedback change future behaviour rather than being
    // read once and forgotten.
    const byCode = new Map<string, { count: number; message: string; microSkill: string; grammarPoint?: string }>();
    for (const finding of evaluation.findings) {
      const existing = byCode.get(finding.errorCode);
      byCode.set(finding.errorCode, {
        count: (existing?.count ?? 0) + 1,
        message: finding.message,
        microSkill: finding.microSkill,
        grammarPoint: finding.grammarPoint,
      });
    }

    for (const [errorCode, info] of byCode) {
      const existing = (await tx
        .select()
        .from(mistakes)
        .where(
          and(
            eq(mistakes.userId, session.userId),
            eq(mistakes.orgId, session.orgId),
            eq(mistakes.errorCode, errorCode),
            eq(mistakes.microSkill, info.microSkill),
          ),
        )
        .limit(1))[0];

      if (existing) {
        await tx.update(mistakes)
          .set({
            occurrences: existing.occurrences + info.count,
            lastSeenAt: now,
            provedStreak: 0,
            resolvedAt: null,
          })
          .where(eq(mistakes.id, existing.id))
          ;
      } else {
        await tx.insert(mistakes)
          .values({
            id: newId('mis'),
            userId: session.userId,
            orgId: session.orgId,
            source: 'writing',
            sourceId: submissionId,
            skill: 'writing',
            microSkill: info.microSkill,
            errorCode,
            summary: info.message,
            detail: `Found ${info.count} time${info.count === 1 ? '' : 's'} in “${task.title}”.`,
            occurrences: info.count,
          })
          ;
      }

      if (info.grammarPoint) {
        const card = (await tx
          .select()
          .from(reviewCards)
          .where(
            and(
              eq(reviewCards.userId, session.userId),
              eq(reviewCards.orgId, session.orgId),
              eq(reviewCards.kind, 'grammar'),
              eq(reviewCards.refId, info.grammarPoint),
            ),
          )
          .limit(1))[0];

        const state = card
          ? {
              stability: card.stability,
              difficulty: card.difficulty,
              reps: card.reps,
              lapses: card.lapses,
              state: card.state,
              lastReviewedAt: card.lastReviewedAt,
              dueAt: card.dueAt,
            }
          : newCard(now);
        const next = review(state, 'again', now);

        if (card) {
          await tx.update(reviewCards)
            .set({
              stability: next.stability,
              difficulty: next.difficulty,
              reps: next.reps,
              lapses: next.lapses,
              state: next.state,
              lastReviewedAt: next.lastReviewedAt,
              dueAt: next.dueAt,
            })
            .where(eq(reviewCards.id, card.id))
            ;
        } else {
          await tx.insert(reviewCards)
            .values({
              id: newId('rvc'),
              userId: session.userId,
              orgId: session.orgId,
              kind: 'grammar',
              refId: info.grammarPoint,
              stability: next.stability,
              difficulty: next.difficulty,
              reps: next.reps,
              lapses: next.lapses,
              state: next.state,
              lastReviewedAt: next.lastReviewedAt,
              dueAt: next.dueAt,
            })
            ;
        }
      }
    }
  });

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'writing.submit',
    entityType: 'writing_submission',
    entityId: submissionId,
    metadata: { taskSlug: task.slug, level: evaluation.estimatedLevel, words: wordCount },
  });

  redirect(`/writing/feedback/${submissionId}`);
}
