'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { learnerProfiles } from '@/lib/db/schema';
import { audit, requireSession } from '@/lib/auth/guard';

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
});

export async function updateSettings(formData: FormData) {
  const session = await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/settings?error=1');

  db.update(learnerProfiles)
    .set({
      targetLevel: parsed.data.targetLevel,
      examDate: parsed.data.examDate ? parsed.data.examDate : null,
      minutesPerDay: parsed.data.minutesPerDay,
      daysPerWeek: parsed.data.daysPerWeek,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(and(eq(learnerProfiles.userId, session.userId), eq(learnerProfiles.orgId, session.orgId)))
    .run();

  audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'settings.update',
    metadata: { targetLevel: parsed.data.targetLevel },
  });

  revalidatePath('/plan');
  revalidatePath('/home');
  redirect('/settings?saved=1');
}
