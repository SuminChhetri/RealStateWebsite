'use server';

import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { learnerProfiles } from '@/lib/db/schema';
import { requireSession, audit } from '@/lib/auth/guard';
import { ensureProfile } from '@/lib/learner/profile';

const schema = z.object({
  targetLevel: z.coerce.number().int().min(5).max(12),
  examDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  minutesPerDay: z.coerce.number().int().min(10).max(240),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  priorAttempts: z.coerce.number().int().min(0).max(20),
  goalContext: z.enum(['immigration', 'citizenship', 'professional', 'academic', 'personal']),
  confidenceReading: z.coerce.number().int().min(1).max(5),
  confidenceListening: z.coerce.number().int().min(1).max(5),
  confidenceWriting: z.coerce.number().int().min(1).max(5),
  confidenceSpeaking: z.coerce.number().int().min(1).max(5),
});

export async function completeOnboarding(formData: FormData) {
  const session = await requireSession();
  await ensureProfile(session.userId, session.orgId);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/onboarding?error=1');

  const data = parsed.data;
  const now = Math.floor(Date.now() / 1000);

  await db.update(learnerProfiles)
    .set({
      targetLevel: data.targetLevel,
      examDate: data.examDate ? data.examDate : null,
      minutesPerDay: data.minutesPerDay,
      daysPerWeek: data.daysPerWeek,
      priorAttempts: data.priorAttempts,
      goalContext: data.goalContext,
      // Self-reported confidence is stored but never used as an estimate. It
      // is a starting point for the diagnostic and a comparison to show the
      // learner later: the gap between how good you feel and how you perform
      // is itself a finding.
      confidence: JSON.stringify({
        reading: data.confidenceReading,
        listening: data.confidenceListening,
        writing: data.confidenceWriting,
        speaking: data.confidenceSpeaking,
      }),
      onboardedAt: now,
      updatedAt: now,
    })
    .where(and(eq(learnerProfiles.userId, session.userId), eq(learnerProfiles.orgId, session.orgId)))
    ;

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'onboarding.complete',
    metadata: { targetLevel: data.targetLevel, hasExamDate: !!data.examDate },
  });

  redirect('/diagnostic');
}
