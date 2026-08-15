import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { evaluations, mistakes, speakingSubmissions, speakingTasks } from '@/lib/db/schema';
import { newId } from '@/lib/ids';
import { audit, rateLimit, requireSessionApi } from '@/lib/auth/guard';
import { evaluateSpeaking, type EnvelopeSample } from '@/lib/engines/speaking-eval';
import { storage } from '@/lib/providers';
import { nowSeconds } from '@/lib/engines/srs';

/**
 * Speaking submission.
 *
 * Audio arrives as a multipart upload because it is the one payload in this
 * product too large for a server action. Everything about the request is
 * treated as untrusted: the tenant comes from the session cookie, the size and
 * type are checked before a byte is written, and the storage key is derived
 * server-side so no client string reaches the filesystem.
 */

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'];

const metaSchema = z.object({
  taskSlug: z.string().min(1).max(80),
  transcript: z.string().max(20000).default(''),
  transcriptSource: z.enum(['browser_asr', 'manual', 'none']).default('none'),
  durationMs: z.coerce.number().int().min(0).max(600000),
  envelope: z
    .array(z.object({ tMs: z.number(), rms: z.number() }))
    .max(4000)
    .default([]),
});

export async function POST(request: Request) {
  const session = await requireSessionApi();
  if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const limit = await rateLimit(`speaking:${session.userId}`, 60, 3600);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many submissions in the last hour. Try again shortly.' },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Could not read the upload.' }, { status: 400 });
  }

  const rawMeta = form.get('meta');
  if (typeof rawMeta !== 'string') {
    return NextResponse.json({ error: 'Missing submission details.' }, { status: 400 });
  }

  let parsedMeta: z.infer<typeof metaSchema>;
  try {
    parsedMeta = metaSchema.parse(JSON.parse(rawMeta));
  } catch {
    return NextResponse.json({ error: 'Submission details were malformed.' }, { status: 400 });
  }

  const task = (await db.select().from(speakingTasks).where(eq(speakingTasks.slug, parsedMeta.taskSlug)).limit(1))[0];
  if (!task || task.status !== 'published') {
    return NextResponse.json({ error: 'That task could not be found.' }, { status: 404 });
  }

  const submissionId = newId('ssb');
  let audioKey: string | null = null;
  let audioMimeType: string | null = null;

  const audio = form.get('audio');
  if (audio instanceof File && audio.size > 0) {
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'That recording is too large.' }, { status: 413 });
    }
    const baseType = audio.type.split(';')[0];
    if (!ALLOWED_TYPES.includes(baseType)) {
      return NextResponse.json({ error: 'Unsupported audio format.' }, { status: 415 });
    }
    // Key is namespaced by tenant so a future object-store migration keeps
    // isolation without a rename.
    audioKey = `${session.orgId}/${session.userId}/${submissionId}.audio`;
    audioMimeType = baseType;
    const buffer = Buffer.from(await audio.arrayBuffer());
    await storage().put(audioKey, buffer, baseType);
  }

  const evaluation = evaluateSpeaking({
    task: {
      taskType: task.taskType,
      taskNumber: task.taskNumber,
      title: task.title,
      prompt: task.prompt,
      successCriteria: JSON.parse(task.successCriteria) as string[],
      prepSeconds: task.prepSeconds,
      speakSeconds: task.speakSeconds,
    },
    transcript: parsedMeta.transcript,
    transcriptSource: parsedMeta.transcriptSource,
    durationMs: parsedMeta.durationMs,
    envelope: parsedMeta.envelope as EnvelopeSample[],
  });

  const now = nowSeconds();
  const evaluationId = newId('evl');

  await db.transaction(async (tx) => {
    await tx.insert(speakingSubmissions)
      .values({
        id: submissionId,
        userId: session.userId,
        orgId: session.orgId,
        taskId: task.id,
        audioKey,
        audioMimeType,
        durationMs: parsedMeta.durationMs,
        transcript: parsedMeta.transcript,
        transcriptSource: parsedMeta.transcriptSource,
        timeline: JSON.stringify(parsedMeta.envelope.slice(0, 1500)),
      })
      ;

    await tx.insert(evaluations)
      .values({
        id: evaluationId,
        userId: session.userId,
        orgId: session.orgId,
        submissionType: 'speaking',
        submissionId,
        engine: evaluation.engine,
        engineVersion: evaluation.engineVersion,
        dimensions: JSON.stringify(evaluation.dimensions),
        estimatedLevel: evaluation.estimatedLevel,
        levelSe: evaluation.levelSe,
        findings: JSON.stringify({
          usage: evaluation.findings,
          criteriaCoverage: evaluation.criteriaCoverage,
          metrics: evaluation.metrics,
          transcriptQuality: evaluation.transcriptQuality,
        }),
        coaching: JSON.stringify(evaluation.coaching),
        limitations: JSON.stringify(evaluation.limitations),
      })
      ;

    // Dimensions that come back well below target become entries in the
    // mistake bank, so speaking weaknesses feed the same loop as everything
    // else rather than living in a one-off report.
    for (const dimension of evaluation.dimensions) {
      if (dimension.level > 7.5) continue;
      const errorCode = `${dimension.microSkill}.pattern`;
      const existing = (await tx
        .select()
        .from(mistakes)
        .where(
          and(
            eq(mistakes.userId, session.userId),
            eq(mistakes.orgId, session.orgId),
            eq(mistakes.errorCode, errorCode),
            eq(mistakes.microSkill, dimension.microSkill),
          ),
        )
        .limit(1))[0];

      if (existing) {
        await tx.update(mistakes)
          .set({ occurrences: existing.occurrences + 1, lastSeenAt: now, provedStreak: 0, resolvedAt: null })
          .where(eq(mistakes.id, existing.id))
          ;
      } else {
        await tx.insert(mistakes)
          .values({
            id: newId('mis'),
            userId: session.userId,
            orgId: session.orgId,
            source: 'speaking',
            sourceId: submissionId,
            skill: 'speaking',
            microSkill: dimension.microSkill,
            errorCode,
            summary: dimension.note,
            detail: dimension.evidence.join(' · '),
          })
          ;
      }
    }
  });

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'speaking.submit',
    entityType: 'speaking_submission',
    entityId: submissionId,
    metadata: { taskSlug: task.slug, level: evaluation.estimatedLevel, hasTranscript: evaluation.transcriptQuality },
  });

  return NextResponse.json({ ok: true, redirect: `/speaking/feedback/${submissionId}` });
}
