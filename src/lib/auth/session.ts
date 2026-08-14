import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { and, eq, lt } from 'drizzle-orm';
import { db } from '../db/client';
import { authSessions, memberships, organizations, users } from '../db/schema';
import { newId } from '../ids';

const COOKIE = 'meridian_session';
const TTL_SECONDS = 60 * 60 * 24 * 30;

/**
 * Sessions are opaque random tokens. Only the SHA-256 of the token is stored,
 * so a database disclosure does not yield usable session credentials.
 */
function tokenId(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface SessionContext {
  userId: string;
  orgId: string;
  role: 'owner' | 'admin' | 'teacher' | 'learner' | 'reviewer';
  name: string;
  email: string;
  orgName: string;
  orgKind: string;
}

export async function createSession(userId: string, orgId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;

  await db.insert(authSessions).values({
    id: tokenId(token),
    userId,
    activeOrgId: orgId,
    expiresAt,
    userAgentHash: userAgent ? createHash('sha256').update(userAgent).digest('hex').slice(0, 32) : null,
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_SECONDS,
  });

  // Opportunistic cleanup; cheap enough at login frequency to avoid a cron.
  await db.delete(authSessions).where(lt(authSessions.expiresAt, Math.floor(Date.now() / 1000)));
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.delete(authSessions).where(eq(authSessions.id, tokenId(token)));
  store.delete(COOKIE);
}

/** Resolve the caller. Returns null when unauthenticated — never throws. */
export async function getSession(): Promise<SessionContext | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      userId: authSessions.userId,
      orgId: authSessions.activeOrgId,
      expiresAt: authSessions.expiresAt,
      name: users.name,
      email: users.email,
      role: memberships.role,
      orgName: organizations.name,
      orgKind: organizations.kind,
    })
    .from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .innerJoin(organizations, eq(organizations.id, authSessions.activeOrgId))
    .innerJoin(
      memberships,
      and(eq(memberships.userId, authSessions.userId), eq(memberships.orgId, authSessions.activeOrgId)),
    )
    .where(eq(authSessions.id, tokenId(token)))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt < Math.floor(Date.now() / 1000)) {
    await db.delete(authSessions).where(eq(authSessions.id, tokenId(token)));
    return null;
  }

  return {
    userId: row.userId,
    orgId: row.orgId,
    role: row.role,
    name: row.name,
    email: row.email,
    orgName: row.orgName,
    orgKind: row.orgKind,
  };
}

export async function registerUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<{ userId: string; orgId: string }> {
  const userId = newId('usr');
  const orgId = newId('org');

  await db.transaction(async (tx) => {
    await tx
      .insert(users)
      .values({ id: userId, email: input.email.toLowerCase(), name: input.name, passwordHash: input.passwordHash });
    await tx.insert(organizations).values({
      id: orgId,
      slug: `personal-${orgId.slice(-8)}`,
      name: `${input.name.split(' ')[0]}’s workspace`,
      kind: 'personal',
    });
    await tx.insert(memberships).values({ id: newId('mem'), userId, orgId, role: 'owner' });
  });

  return { userId, orgId };
}
