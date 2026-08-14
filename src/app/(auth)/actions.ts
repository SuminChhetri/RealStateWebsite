'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { memberships, users } from '@/lib/db/schema';
import { decoyHash, hashPassword, passwordProblems, verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, registerUser } from '@/lib/auth/session';
import { audit, rateLimit } from '@/lib/auth/guard';
import { ensureProfile } from '@/lib/learner/profile';

const credentials = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(200),
});

const registration = credentials.extend({
  name: z.string().trim().min(1, 'Enter your name.').max(80),
});

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function clientKey(prefix: string, identifier: string): Promise<string> {
  const store = await headers();
  const ip = store.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  return `${prefix}:${createHash('sha256').update(`${ip}:${identifier}`).digest('hex').slice(0, 24)}`;
}

async function primaryOrgId(userId: string): Promise<string | null> {
  const [membership] = await db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(memberships.createdAt)
    .limit(1);
  return membership?.orgId ?? null;
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function signIn(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  // Limited per (address, email) so an attack on one account cannot be spread
  // across addresses, and a shared address cannot lock out everyone behind it.
  const limit = await rateLimit(await clientKey('signin', parsed.data.email), 8, 300);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).` };
  }

  const user = (await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1))[0];
  // Verify against a decoy when the address is unknown, so both paths do the
  // same work and the response time does not disclose whether an account exists.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await decoyHash()));

  if (!user || !ok) {
    await audit({ action: 'auth.sign_in.failed', metadata: { email: parsed.data.email } });
    return { error: 'That email and password do not match an account.' };
  }

  const orgId = await primaryOrgId(user.id);
  if (!orgId) return { error: 'This account has no workspace attached.' };

  await db.update(users).set({ lastSeenAt: Math.floor(Date.now() / 1000) }).where(eq(users.id, user.id));
  await createSession(user.id, orgId, (await headers()).get('user-agent'));
  await ensureProfile(user.id, orgId);
  await audit({ orgId, actorId: user.id, action: 'auth.sign_in' });

  redirect('/home');
}

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registration.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const problems = passwordProblems(parsed.data.password);
  if (problems.length) return { fieldErrors: { password: problems.join(' ') } };

  const limit = await rateLimit(await clientKey('signup', parsed.data.email), 5, 900);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).` };
  }

  if ((await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1))[0]) {
    return { fieldErrors: { email: 'An account already exists for this address.' } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const { userId, orgId } = await registerUser({
    email: parsed.data.email,
    name: parsed.data.name,
    passwordHash,
  });

  await createSession(userId, orgId, (await headers()).get('user-agent'));
  await ensureProfile(userId, orgId);
  await audit({ orgId, actorId: userId, action: 'auth.sign_up' });

  redirect('/onboarding');
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect('/');
}
