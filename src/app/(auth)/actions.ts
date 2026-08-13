'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { memberships, users } from '@/lib/db/schema';
import { hashPassword, passwordProblems, verifyPassword } from '@/lib/auth/password';
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

/** Placeholder hash used so a missing account costs the same time as a wrong password. */
const DUMMY_HASH =
  'scrypt$32768$8$1$c2FsdHNhbHRzYWx0c2FsdA==$aGFzaGhhc2hoYXNoaGFzaGhhc2hoYXNoaGFzaGhhc2g=';

async function clientKey(prefix: string, identifier: string): Promise<string> {
  const store = await headers();
  const ip = store.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  return `${prefix}:${createHash('sha256').update(`${ip}:${identifier}`).digest('hex').slice(0, 24)}`;
}

function primaryOrgId(userId: string): string | null {
  const membership = db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(memberships.createdAt)
    .get();
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
  const limit = rateLimit(await clientKey('signin', parsed.data.email), 8, 300);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).` };
  }

  const user = db.select().from(users).where(eq(users.email, parsed.data.email)).get();
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !ok) {
    audit({ action: 'auth.sign_in.failed', metadata: { email: parsed.data.email } });
    return { error: 'That email and password do not match an account.' };
  }

  const orgId = primaryOrgId(user.id);
  if (!orgId) return { error: 'This account has no workspace attached.' };

  db.update(users).set({ lastSeenAt: Math.floor(Date.now() / 1000) }).where(eq(users.id, user.id)).run();
  await createSession(user.id, orgId, (await headers()).get('user-agent'));
  ensureProfile(user.id, orgId);
  audit({ orgId, actorId: user.id, action: 'auth.sign_in' });

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

  const limit = rateLimit(await clientKey('signup', parsed.data.email), 5, 900);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).` };
  }

  if (db.select().from(users).where(eq(users.email, parsed.data.email)).get()) {
    return { fieldErrors: { email: 'An account already exists for this address.' } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const { userId, orgId } = await registerUser({
    email: parsed.data.email,
    name: parsed.data.name,
    passwordHash,
  });

  await createSession(userId, orgId, (await headers()).get('user-agent'));
  ensureProfile(userId, orgId);
  audit({ orgId, actorId: userId, action: 'auth.sign_up' });

  redirect('/onboarding');
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect('/');
}
