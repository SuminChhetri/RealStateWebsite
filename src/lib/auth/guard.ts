import 'server-only';
import { redirect } from 'next/navigation';
import { eq, and, gte } from 'drizzle-orm';
import { db } from '../db/client';
import { auditLogs, rateLimits } from '../db/schema';
import { newId } from '../ids';
import { getSession, type SessionContext } from './session';

/**
 * The single authorization choke point.
 *
 * Every server action and route handler that touches learner data calls
 * `requireSession()` and then scopes its queries with the returned `orgId` and
 * `userId`. No caller ever accepts a tenant identifier from the client, so a
 * forged request cannot reach another organisation's rows: the identifier is
 * derived from the session cookie server-side or the request is rejected.
 */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect('/sign-in');
  return session;
}

/** For route handlers, which must return a response rather than redirect. */
export async function requireSessionApi(): Promise<SessionContext | null> {
  return getSession();
}

const ROLE_RANK: Record<SessionContext['role'], number> = {
  learner: 0,
  reviewer: 1,
  teacher: 2,
  admin: 3,
  owner: 4,
};

export async function requireRole(min: SessionContext['role']): Promise<SessionContext> {
  const session = await requireSession();
  if (ROLE_RANK[session.role] < ROLE_RANK[min]) redirect('/home');
  return session;
}

export function can(session: SessionContext, min: SessionContext['role']): boolean {
  return ROLE_RANK[session.role] >= ROLE_RANK[min];
}

/**
 * Fixed-window rate limiter backed by the database so limits survive a restart
 * and apply across processes. Used on authentication and on the evaluation
 * endpoints, which are the expensive ones.
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): { ok: boolean; retryAfter: number } {
  const now = Math.floor(Date.now() / 1000);
  const row = db.select().from(rateLimits).where(eq(rateLimits.key, key)).get();

  if (!row || now - row.windowStart >= windowSeconds) {
    db.insert(rateLimits)
      .values({ key, count: 1, windowStart: now })
      .onConflictDoUpdate({ target: rateLimits.key, set: { count: 1, windowStart: now } })
      .run();
    return { ok: true, retryAfter: 0 };
  }

  if (row.count >= limit) {
    return { ok: false, retryAfter: windowSeconds - (now - row.windowStart) };
  }

  db.update(rateLimits).set({ count: row.count + 1 }).where(eq(rateLimits.key, key)).run();
  return { ok: true, retryAfter: 0 };
}

export function audit(entry: {
  orgId?: string | null;
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): void {
  db.insert(auditLogs)
    .values({
      id: newId('aud'),
      orgId: entry.orgId ?? null,
      actorId: entry.actorId ?? null,
      action: entry.action,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      metadata: JSON.stringify(entry.metadata ?? {}),
    })
    .run();
}

/**
 * Assert that a row belongs to the caller's tenant before acting on it.
 * Used by every mutation that takes an id from the client.
 */
export function assertOwned<T extends { userId: string; orgId: string }>(
  row: T | undefined,
  session: SessionContext,
): T {
  if (!row || row.userId !== session.userId || row.orgId !== session.orgId) {
    throw new Error('NOT_FOUND');
  }
  return row;
}

export { and, eq, gte };
