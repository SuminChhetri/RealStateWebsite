'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { learnerProfiles, organizations, users } from '@/lib/db/schema';
import { audit, rateLimit, requireSession } from '@/lib/auth/guard';
import { destroySession } from '@/lib/auth/session';
import { isThemeKey } from '@/lib/theme';

/** Save the reading theme. Called from the picker, which has already applied it. */
export async function saveTheme(theme: string): Promise<void> {
  const session = await requireSession();
  if (!isThemeKey(theme)) return;

  await db
    .update(learnerProfiles)
    .set({ theme, updatedAt: Math.floor(Date.now() / 1000) })
    .where(and(eq(learnerProfiles.userId, session.userId), eq(learnerProfiles.orgId, session.orgId)));
}

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(80),
});

export async function updateProfile(formData: FormData) {
  const session = await requireSession();
  const parsed = profileSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) redirect('/profile?error=name');

  await db.update(users).set({ name: parsed.data.name }).where(eq(users.id, session.userId));

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'profile.update',
    entityType: 'user',
    entityId: session.userId,
  });

  revalidatePath('/profile');
  redirect('/profile?saved=1');
}

/**
 * Delete the account and everything attached to it.
 *
 * This is the one irreversible action in the product, so it is built to be hard
 * to do by accident and impossible to do halfway:
 *
 *  - the learner must type their own email address to confirm, which cannot
 *    happen by a mis-click or a stray Enter key on a focused button;
 *  - it is rate limited, because a delete endpoint is worth attacking;
 *  - the personal organisation goes with the user. Every tenant-scoped table
 *    cascades from `users` or `organizations`, so removing both removes the
 *    attempts, submissions, estimates, mistakes, review cards and progress
 *    history in one transaction rather than leaving orphaned rows behind;
 *  - the session cookie is cleared before redirecting, so the browser is not
 *    left holding a token for a user that no longer exists.
 *
 * The audit row is written *before* the delete, so the record of the deletion
 * survives the rows it is about.
 */
export async function deleteAccount(formData: FormData) {
  const session = await requireSession();

  const limit = await rateLimit(`delete-account:${session.userId}`, 5, 3600);
  if (!limit.ok) redirect('/profile?error=rate');

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) redirect('/profile?error=missing');

  const typed = String(formData.get('confirmEmail') ?? '')
    .trim()
    .toLowerCase();
  if (typed !== user.email.toLowerCase()) redirect('/profile?error=confirm');

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'account.delete',
    entityType: 'user',
    entityId: session.userId,
    metadata: { email: user.email },
  });

  await db.transaction(async (tx) => {
    // The personal organisation exists only for this learner, so it goes too.
    // A shared organisation must not be removed by one member leaving it.
    const [org] = await tx
      .select()
      .from(organizations)
      .where(eq(organizations.id, session.orgId))
      .limit(1);

    await tx.delete(users).where(eq(users.id, session.userId));
    if (org?.kind === 'personal') {
      await tx.delete(organizations).where(eq(organizations.id, org.id));
    }
  });

  await destroySession();
  redirect('/?deleted=1');
}
