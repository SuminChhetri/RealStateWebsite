import 'server-only';
import { redirect } from 'next/navigation';
import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { auditLogs, organizations, rateLimits } from '../db/schema';
import {
  DEFAULT_PLAN_KEY,
  planFor,
  planRequiredFor,
  type FeatureKey,
  type Plan,
} from '../billing/plans';
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
 *
 * This is the only tenancy boundary the application relies on. The database
 * additionally denies everything through row-level security, but that policy
 * protects against a leaked Supabase anon key rather than against a bug here —
 * the application's own role bypasses it.
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

/* ------------------------------------------------------------------ */
/* Entitlements                                                        */
/* ------------------------------------------------------------------ */

/**
 * The plan this session's organisation is on.
 *
 * Read from the organisation rather than the session, because a plan can change
 * between a session being issued and a page being rendered, and the newer answer
 * is the correct one.
 */
export async function currentPlan(session: SessionContext): Promise<Plan> {
  const [org] = await db
    .select({ planKey: organizations.planKey })
    .from(organizations)
    .where(eq(organizations.id, session.orgId))
    .limit(1);
  return planFor(org?.planKey ?? DEFAULT_PLAN_KEY);
}

/**
 * The single answer to "may this account use this".
 *
 * Server-side and used by every gated surface. Hiding a link in the interface
 * is presentation; this is the gate. A paywall enforced in six places leaks in
 * at least one of them.
 */
export async function checkFeature(
  session: SessionContext,
  feature: FeatureKey,
): Promise<{ allowed: boolean; plan: Plan; required: Plan | null }> {
  const plan = await currentPlan(session);
  return {
    allowed: plan.features.includes(feature),
    plan,
    required: planRequiredFor(feature),
  };
}

/**
 * Fixed-window rate limiter backed by the database so limits survive a restart
 * and apply across every instance. Used on authentication and on the
 * evaluation endpoints, which are the expensive ones.
 *
 * The whole check is one statement: an upsert that either starts a new window
 * or increments the current one, returning the resulting count. Doing it in a
 * single round trip means two concurrent requests cannot both read a stale
 * count and both decide they are under the limit.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  const now = Math.floor(Date.now() / 1000);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.windowStart} <= ${now - windowSeconds} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${rateLimits.windowStart} <= ${now - windowSeconds} then ${now} else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart });

  if (!row) return { ok: true, retryAfter: 0 };
  if (row.count > limit) {
    return { ok: false, retryAfter: Math.max(1, windowSeconds - (now - row.windowStart)) };
  }
  return { ok: true, retryAfter: 0 };
}

export async function audit(entry: {
  orgId?: string | null;
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(auditLogs).values({
    id: newId('aud'),
    orgId: entry.orgId ?? null,
    actorId: entry.actorId ?? null,
    action: entry.action,
    entityType: entry.entityType ?? null,
    entityId: entry.entityId ?? null,
    metadata: JSON.stringify(entry.metadata ?? {}),
  });
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
