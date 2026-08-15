import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { reviewRequests } from '@/lib/db/schema';
import type { SessionContext } from '@/lib/auth/session';

/**
 * Who may read a submission that is not their own.
 *
 * Human review needs one narrow exception to "a learner's work is theirs
 * alone", and the exception has to be drawn tightly or it stops being an
 * exception. The rule here is not "teachers can read learners' work" — it is
 * "the teacher who has claimed this specific piece can read this specific
 * piece, for as long as they hold it".
 *
 * That distinction matters most for audio. A speaking review done from the
 * transcript alone is close to worthless: pronunciation, stress, intonation and
 * hesitation are exactly what separates a strong CLB 10 from a CLB 12, and none
 * of them survive transcription. So the reviewer must be able to hear it — and
 * only the reviewer holding it, only while they hold it.
 */

export const REVIEWER_ROLES = ['teacher', 'reviewer', 'admin', 'owner'] as const;

export function isReviewerRole(role: string): boolean {
  return (REVIEWER_ROLES as readonly string[]).includes(role);
}

/**
 * Someone who joined an organisation to read other people's work rather than to
 * study. Owners and admins are excluded: an individual learner owns their own
 * personal organisation, so "owner" says nothing about why they are here.
 */
export function isReviewerOnlyRole(role: string): boolean {
  return role === 'teacher' || role === 'reviewer';
}

/**
 * True when this session holds a review of this submission — claimed, or
 * already returned by them. Returning it does not revoke access, because a
 * teacher asked "why did you say that" needs to be able to look again.
 */
export async function holdsReviewOf(
  session: SessionContext,
  submissionType: 'writing' | 'speaking',
  submissionId: string,
): Promise<boolean> {
  if (!isReviewerRole(session.role)) return false;

  const [held] = await db
    .select({ id: reviewRequests.id })
    .from(reviewRequests)
    .where(
      and(
        eq(reviewRequests.submissionType, submissionType),
        eq(reviewRequests.submissionId, submissionId),
        // Tenancy is checked here as well as on the submission itself. Two
        // independent checks on the same boundary is deliberate: this one is
        // reached by a different route than the page query.
        eq(reviewRequests.orgId, session.orgId),
        eq(reviewRequests.reviewerId, session.userId),
      ),
    )
    .limit(1);

  return Boolean(held);
}
