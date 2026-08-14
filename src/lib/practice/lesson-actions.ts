'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { lessonProgress, lessons, reviewCards } from '@/lib/db/schema';
import { audit, rateLimit, requireSession } from '@/lib/auth/guard';
import { newId } from '@/lib/ids';
import { newCard } from '@/lib/engines/srs';
import { tryMicroSkill } from '@/lib/content/taxonomy';

/**
 * Closing the lesson loop.
 *
 * A checkpoint is a retrieval event. Before this existed, the learner answered
 * one, saw whether they were right, and that was the end of it: nothing was
 * recorded, so nothing could be scheduled, nothing could be reported back, and
 * the study plan had no way of knowing the lesson had ever been read — which
 * meant it could recommend the same lesson indefinitely.
 *
 * Three things now happen when a lesson is finished:
 *
 *  1. The result is stored, so the lesson can report what did and did not land
 *     rather than only that it was opened.
 *  2. Every missed checkpoint becomes a review card, so the idea comes back on
 *     the schedule the forgetting curve implies rather than never.
 *  3. The lesson is marked complete, so recommendations move on.
 *
 * What deliberately does *not* happen: a lesson checkpoint does not move the
 * ability estimate. A checkpoint is written to teach — it sits directly under
 * the explanation that answers it, and getting it right is evidence you read
 * the paragraph, not evidence you can do this under exam conditions. Treating
 * it as measurement would inflate the estimate, so practice items remain the
 * only thing that moves it.
 */

const completeSchema = z.object({
  lessonSlug: z.string().min(1).max(96),
  responses: z
    .array(
      z.object({
        index: z.number().int().min(0).max(80),
        prompt: z.string().max(400),
        correct: z.boolean(),
      }),
    )
    .max(40),
});

export interface LessonOutcome {
  ok: boolean;
  total: number;
  correct: number;
  /** Micro-skill slugs whose checkpoint was missed, resolved to labels. */
  missed: { microSkill: string; label: string }[];
  scheduled: number;
  error?: string;
}

export async function completeLesson(payload: unknown): Promise<LessonOutcome> {
  const empty: LessonOutcome = { ok: false, total: 0, correct: 0, missed: [], scheduled: 0 };

  const session = await requireSession();
  const parsed = completeSchema.safeParse(payload);
  if (!parsed.success) return { ...empty, error: 'Your answers could not be read.' };

  const limit = await rateLimit(`lesson:${session.userId}`, 120, 3600);
  if (!limit.ok) return { ...empty, error: 'Too many submissions. Try again shortly.' };

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.slug, parsed.data.lessonSlug))
    .limit(1);
  if (!lesson) return { ...empty, error: 'That lesson could not be found.' };

  const responses = parsed.data.responses;
  const total = responses.length;
  const correct = responses.filter((r) => r.correct).length;

  // A missed checkpoint is attributed to the lesson's micro-skills. The
  // mapping is coarse — a lesson usually teaches two or three — but it is
  // honest at that resolution and it is what the planner reasons over.
  const microSkills = JSON.parse(lesson.microSkills) as string[];
  const missedAny = correct < total;
  const missedMicroSkills = missedAny ? microSkills : [];

  const now = Math.floor(Date.now() / 1000);

  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, session.userId),
        eq(lessonProgress.orgId, session.orgId),
        eq(lessonProgress.lessonId, lesson.id),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        checkpointsTotal: total,
        checkpointsCorrect: correct,
        responses: JSON.stringify(responses),
        missedMicroSkills: JSON.stringify(missedMicroSkills),
        visits: existing.visits + 1,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    await db.insert(lessonProgress).values({
      id: newId('lpr'),
      userId: session.userId,
      orgId: session.orgId,
      lessonId: lesson.id,
      checkpointsTotal: total,
      checkpointsCorrect: correct,
      responses: JSON.stringify(responses),
      missedMicroSkills: JSON.stringify(missedMicroSkills),
      completedAt: now,
      updatedAt: now,
    });
  }

  // Every missed checkpoint returns on the retrieval schedule. Scheduling is
  // per checkpoint rather than per lesson, because "the third idea did not
  // land" is a more useful thing to bring back than "revisit this lesson".
  let scheduled = 0;
  for (const response of responses) {
    if (response.correct) continue;
    const card = newCard();
    await db
      .insert(reviewCards)
      .values({
        id: newId('rvc'),
        userId: session.userId,
        orgId: session.orgId,
        kind: 'lesson_point',
        refId: `${lesson.slug}#${response.index}`,
        stability: card.stability,
        difficulty: card.difficulty,
        dueAt: card.dueAt,
        state: 'new',
      })
      .onConflictDoUpdate({
        target: [reviewCards.userId, reviewCards.orgId, reviewCards.kind, reviewCards.refId],
        // Missing it a second time resets the interval; that is a lapse, and
        // the scheduler treats it as one.
        set: { dueAt: card.dueAt, state: 'relearning', stability: card.stability },
      });
    scheduled++;
  }

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'lesson.complete',
    entityType: 'lesson',
    entityId: lesson.slug,
    metadata: { total, correct, scheduled },
  });

  return {
    ok: true,
    total,
    correct,
    missed: missedMicroSkills.map((slug) => ({
      microSkill: slug,
      label: tryMicroSkill(slug)?.label ?? slug,
    })),
    scheduled,
  };
}
