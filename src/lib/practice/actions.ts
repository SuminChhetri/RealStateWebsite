'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { attempts, learnerProfiles, reviewCards } from '@/lib/db/schema';
import { requireSession, audit, rateLimit } from '@/lib/auth/guard';
import { getProfile } from '@/lib/learner/profile';
import { createAttempt, recentlySeen } from './delivery';
import { replenish } from './replenish';
import { submitAttempt, type SubmittedResponse } from './submit';
import { targetDifficulty } from '@/lib/engines/ability';
import type { Skill } from '@/lib/content/taxonomy';

const startSchema = z.object({
  skill: z.enum(['reading', 'listening', 'mixed']),
  mode: z.enum(['drill', 'section', 'diagnostic', 'review', 'remediation']).default('drill'),
  microSkill: z.string().max(64).optional(),
  partType: z.string().max(64).optional(),
  count: z.coerce.number().int().min(4).max(40).default(8),
  timed: z
    .union([z.literal('on'), z.literal('off'), z.boolean()])
    .transform((v) => v === true || v === 'on')
    .default('on'),
});

/**
 * Build a set and hand the learner to the runner. Ability targets come from
 * the learner's own profile, so two people starting "reading practice" get
 * different items.
 */
export async function startPractice(formData: FormData) {
  const session = await requireSession();
  const parsed = startSchema.safeParse({
    skill: formData.get('skill'),
    mode: formData.get('mode') ?? 'drill',
    microSkill: formData.get('microSkill') || undefined,
    partType: formData.get('partType') || undefined,
    count: formData.get('count') ?? 8,
    timed: formData.get('timed') ?? 'off',
  });
  if (!parsed.success) redirect('/home');

  const limit = await rateLimit(`practice:${session.userId}`, 60, 3600);
  if (!limit.ok) redirect('/home?error=rate-limited');

  // Top the bank up before selecting, not after, so a learner who has worked
  // through most of the corpus still gets a set of unseen items rather than a
  // set of remembered ones. Normally a no-op.
  if (parsed.data.skill !== 'mixed') {
    await replenish(session.userId, session.orgId, parsed.data.skill);
  }

  const profile = await getProfile(session.userId, session.orgId);
  const abilityByMicroSkill: Record<string, number> = {};
  for (const m of profile.microEstimates) abilityByMicroSkill[m.microSkill] = m.theta;

  const skillEstimate = profile.skills.find((s) => s.skill === parsed.data.skill);
  const defaultAbility =
    skillEstimate && skillEstimate.observations > 0 ? skillEstimate.level : profile.targetLevel - 2;

  const set = await createAttempt({
    userId: session.userId,
    orgId: session.orgId,
    skill: parsed.data.skill as Skill | 'mixed',
    mode: parsed.data.mode,
    count: parsed.data.count,
    timed: parsed.data.timed,
    abilityByMicroSkill,
    defaultAbility,
    focusMicroSkills: parsed.data.microSkill ? [parsed.data.microSkill] : [],
    partType: parsed.data.partType,
    excludeQuestionIds: await recentlySeen(session.userId, session.orgId),
    blueprint: {
      requestedBy: 'learner',
      targetDifficulty: Math.round(targetDifficulty(defaultAbility) * 100) / 100,
    },
  });

  if (!set) redirect('/home?error=no-content');

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'practice.start',
    entityType: 'attempt',
    entityId: set.attemptId,
    metadata: { skill: parsed.data.skill, mode: parsed.data.mode, count: set.questions.length },
  });

  redirect(`/session/${set.attemptId}`);
}

/** The diagnostic: a fixed-length mixed set that samples the profile broadly. */
export async function startDiagnostic() {
  const session = await requireSession();
  const profile = await getProfile(session.userId, session.orgId);

  const set = await createAttempt({
    userId: session.userId,
    orgId: session.orgId,
    skill: 'mixed',
    mode: 'diagnostic',
    count: 24,
    timed: true,
    abilityByMicroSkill: {},
    // Start the diagnostic slightly below the target so early items are
    // informative without being demoralising, then let the estimate move.
    defaultAbility: Math.max(6, profile.targetLevel - 2.5),
    focusMicroSkills: [],
    blueprint: { purpose: 'profile', breadth: 'all-micro-skills' },
  });

  if (!set) redirect('/home?error=no-content');

  await db.update(learnerProfiles)
    .set({ diagnosticAttemptId: set.attemptId })
    .where(and(eq(learnerProfiles.userId, session.userId), eq(learnerProfiles.orgId, session.orgId)))
    ;

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'diagnostic.start',
    entityType: 'attempt',
    entityId: set.attemptId,
  });

  redirect(`/session/${set.attemptId}`);
}

/** A set built from the items spaced retrieval says are due today. */
export async function startReview() {
  const session = await requireSession();
  const now = Math.floor(Date.now() / 1000);

  const due = (await db
    .select()
    .from(reviewCards)
    .where(
      and(
        eq(reviewCards.userId, session.userId),
        eq(reviewCards.orgId, session.orgId),
        eq(reviewCards.kind, 'question'),
      ),
    )
    )
    .filter((c) => c.dueAt <= now);

  if (!due.length) redirect('/review?empty=1');

  const profile = await getProfile(session.userId, session.orgId);
  const abilityByMicroSkill: Record<string, number> = {};
  for (const m of profile.microEstimates) abilityByMicroSkill[m.microSkill] = m.theta;

  const set = await createAttempt({
    userId: session.userId,
    orgId: session.orgId,
    skill: 'mixed',
    mode: 'review',
    count: Math.min(15, due.length),
    timed: false,
    abilityByMicroSkill,
    defaultAbility: profile.readiness.overall || profile.targetLevel - 2,
    focusMicroSkills: [],
    // Reversed exclusion: for review we *want* the items already seen, so the
    // due list is passed as the pool by suppressing everything else.
    excludeQuestionIds: [],
    blueprint: { purpose: 'spaced-retrieval', dueCount: due.length },
  });

  if (!set) redirect('/review?empty=1');
  redirect(`/session/${set.attemptId}`);
}

const submitSchema = z.object({
  attemptId: z.string().min(1).max(64),
  responses: z
    .array(
      z.object({
        questionId: z.string().min(1).max(64),
        response: z.string().max(8).nullable(),
        elapsedMs: z.number().int().min(0).max(3_600_000),
        changedAnswer: z.boolean().optional(),
        flagged: z.boolean().optional(),
      }),
    )
    .max(60),
});

export async function submitPractice(payload: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  const parsed = submitSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: 'Your answers could not be read. Nothing was lost — try again.' };

  const attempt = (await db
    .select()
    .from(attempts)
    .where(
      and(
        eq(attempts.id, parsed.data.attemptId),
        eq(attempts.userId, session.userId),
        eq(attempts.orgId, session.orgId),
      ),
    )
    .limit(1))[0];
  if (!attempt) return { ok: false, error: 'That practice set could not be found.' };

  const result = await submitAttempt({
    attemptId: parsed.data.attemptId,
    userId: session.userId,
    orgId: session.orgId,
    responses: parsed.data.responses as SubmittedResponse[],
  });

  if (!result) return { ok: false, error: 'That practice set could not be graded.' };

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'practice.submit',
    entityType: 'attempt',
    entityId: parsed.data.attemptId,
    metadata: { score: result.rawScore, max: result.maxScore },
  });

  return { ok: true };
}

export async function abandonAttempt(attemptId: string) {
  const session = await requireSession();
  await db.update(attempts)
    .set({ abandoned: true, completedAt: Math.floor(Date.now() / 1000) })
    .where(
      and(eq(attempts.id, attemptId), eq(attempts.userId, session.userId), eq(attempts.orgId, session.orgId)),
    )
    ;
  redirect('/home');
}
