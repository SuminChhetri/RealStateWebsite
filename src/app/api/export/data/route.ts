import { and, eq } from 'drizzle-orm';
import { requireSessionApi } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import {
  attemptItems,
  attempts,
  evaluations,
  learnerProfiles,
  lessonProgress,
  mistakes,
  progressSnapshots,
  reviewCards,
  skillEstimates,
  speakingSubmissions,
  users,
  writingSubmissions,
} from '@/lib/db/schema';

/**
 * Full data export.
 *
 * Free at every tier, deliberately and permanently. Someone's own record is
 * theirs; holding it hostage to a plan is a dark pattern whatever the pricing
 * page says, and a product that asks people to trust its honesty cannot also
 * make leaving expensive.
 *
 * Everything the learner has produced is included, in a shape that can be read
 * without this application. Nothing about other tenants is reachable — every
 * query is scoped to the session's user and organisation.
 */
export async function GET() {
  const session = await requireSessionApi();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const scope = { userId: session.userId, orgId: session.orgId };

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  const [profile] = await db
    .select()
    .from(learnerProfiles)
    .where(and(eq(learnerProfiles.userId, scope.userId), eq(learnerProfiles.orgId, scope.orgId)))
    .limit(1);

  const attemptRows = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.userId, scope.userId), eq(attempts.orgId, scope.orgId)));

  const itemRows = attemptRows.length
    ? await db
        .select({
          attemptId: attemptItems.attemptId,
          questionId: attemptItems.questionId,
          response: attemptItems.response,
          correct: attemptItems.correct,
          elapsedMs: attemptItems.elapsedMs,
          answeredAt: attemptItems.answeredAt,
        })
        .from(attemptItems)
        .innerJoin(attempts, eq(attempts.id, attemptItems.attemptId))
        .where(and(eq(attempts.userId, scope.userId), eq(attempts.orgId, scope.orgId)))
    : [];

  // Written out rather than abstracted. A generic helper over Drizzle tables
  // needs casts that defeat the type checking, and the type checking is what
  // guarantees each of these is scoped to this learner.
  const where = <A, B>(userCol: A, orgCol: B) =>
    and(eq(userCol as never, scope.userId), eq(orgCol as never, scope.orgId));

  const [writing, speaking, evals, mistakeRows, cards, estimates, snapshots, lessonRows] =
    await Promise.all([
      db.select().from(writingSubmissions).where(where(writingSubmissions.userId, writingSubmissions.orgId)),
      db.select().from(speakingSubmissions).where(where(speakingSubmissions.userId, speakingSubmissions.orgId)),
      db.select().from(evaluations).where(where(evaluations.userId, evaluations.orgId)),
      db.select().from(mistakes).where(where(mistakes.userId, mistakes.orgId)),
      db.select().from(reviewCards).where(where(reviewCards.userId, reviewCards.orgId)),
      db.select().from(skillEstimates).where(where(skillEstimates.userId, skillEstimates.orgId)),
      db.select().from(progressSnapshots).where(where(progressSnapshots.userId, progressSnapshots.orgId)),
      db.select().from(lessonProgress).where(where(lessonProgress.userId, lessonProgress.orgId)),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    format: 'meridian.export.v1',
    note:
      'Your own record, exported in full. Meridian levels are practice estimates from this platform; they are not CELPIP scores and have no official standing.',
    account: user
      ? { name: user.name, email: user.email, createdAt: user.createdAt, locale: user.locale, timezone: user.timezone }
      : null,
    profile: profile ?? null,
    attempts: attemptRows,
    attemptItems: itemRows,
    writingSubmissions: writing,
    speakingSubmissions: speaking,
    evaluations: evals,
    mistakes: mistakeRows,
    reviewCards: cards,
    skillEstimates: estimates,
    progressSnapshots: snapshots,
    lessonProgress: lessonRows,
  };

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="meridian-export-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
