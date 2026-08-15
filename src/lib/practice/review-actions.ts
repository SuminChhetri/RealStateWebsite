'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { reviewRequests, speakingSubmissions, writingSubmissions } from '@/lib/db/schema';
import { audit, checkFeature, rateLimit, requireSession } from '@/lib/auth/guard';
import { isReviewerRole } from '@/lib/practice/review-access';
import {
  REVIEW_REQUESTS_PER_DAY,
  reviewIdSchema,
  reviewRequestSchema,
  reviewReturnSchema,
} from '@/lib/practice/review-rules';
import { newId } from '@/lib/ids';

/**
 * Human review.
 *
 * The one place in this product where the intelligence is a person. That is
 * deliberate rather than a gap: the analysers are rule-based and say so on
 * every page they appear on, and there are judgements they cannot make —
 * whether an argument persuades, whether an example is apt, whether a response
 * reads as natural rather than assembled. Routing that to a teacher is honest;
 * simulating it would not be.
 *
 * Two rules hold throughout:
 *
 *  - A teacher's judgement is never merged into the analyser's estimate. They
 *    are different kinds of claim and averaging them would hide both. The
 *    learner sees them side by side, labelled.
 *  - Nothing here weakens tenancy. A reviewer can only reach submissions in
 *    their own organisation, and only when their role allows it.
 */

export interface RequestOutcome {
  ok: boolean;
  error?: string;
}

/** A learner asks a teacher to look at a piece of work. */
export async function requestReview(payload: unknown): Promise<RequestOutcome> {
  const session = await requireSession();
  const parsed = reviewRequestSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: 'That request could not be read.' };

  const gate = await checkFeature(session, 'teacher_review');
  if (!gate.allowed) {
    return {
      ok: false,
      error: `Human review is part of ${gate.required?.name ?? 'a paid plan'}. Your organisation is on ${gate.plan.name}.`,
    };
  }

  const limit = await rateLimit(`review-request:${session.userId}`, REVIEW_REQUESTS_PER_DAY, 86400);
  if (!limit.ok) {
    return { ok: false, error: 'You have asked for a lot of reviews today. Try again tomorrow.' };
  }

  // The submission must be the learner's own. Reading the row is the check.
  const owned =
    parsed.data.submissionType === 'writing'
      ? await db
          .select({ id: writingSubmissions.id })
          .from(writingSubmissions)
          .where(
            and(
              eq(writingSubmissions.id, parsed.data.submissionId),
              eq(writingSubmissions.userId, session.userId),
              eq(writingSubmissions.orgId, session.orgId),
            ),
          )
          .limit(1)
      : await db
          .select({ id: speakingSubmissions.id })
          .from(speakingSubmissions)
          .where(
            and(
              eq(speakingSubmissions.id, parsed.data.submissionId),
              eq(speakingSubmissions.userId, session.userId),
              eq(speakingSubmissions.orgId, session.orgId),
            ),
          )
          .limit(1);

  if (!owned.length) return { ok: false, error: 'That submission could not be found.' };

  await db
    .insert(reviewRequests)
    .values({
      id: newId('rvq'),
      userId: session.userId,
      orgId: session.orgId,
      submissionType: parsed.data.submissionType,
      submissionId: parsed.data.submissionId,
      question: parsed.data.question || null,
      status: 'requested',
    })
    // Asking twice is not an error; it is someone adding a question they forgot.
    .onConflictDoUpdate({
      target: [reviewRequests.submissionType, reviewRequests.submissionId],
      set: { question: parsed.data.question || null },
    });

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'review.request',
    entityType: parsed.data.submissionType,
    entityId: parsed.data.submissionId,
  });

  revalidatePath(`/${parsed.data.submissionType}/feedback/${parsed.data.submissionId}`);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Teacher side                                                        */
/* ------------------------------------------------------------------ */

/** Only these roles may review. A learner never sees another learner's work. */
async function requireReviewer() {
  const session = await requireSession();
  const gate = await checkFeature(session, 'teacher_review');
  if (!gate.allowed) return { session, allowed: false as const, gate };
  return { session, allowed: isReviewerRole(session.role), gate };
}

/** Take a request off the queue so two teachers do not write over each other. */
export async function claimReview(formData: FormData): Promise<void> {
  const { session, allowed } = await requireReviewer();
  if (!allowed) return;

  const parsed = reviewIdSchema.safeParse({ id: formData.get('id') });
  if (!parsed.success) return;

  // Conditional on still being unclaimed: whoever gets there first wins, and
  // the loser is told rather than silently overwriting a colleague.
  await db
    .update(reviewRequests)
    .set({ status: 'claimed', reviewerId: session.userId, claimedAt: Math.floor(Date.now() / 1000) })
    .where(
      and(
        eq(reviewRequests.id, parsed.data.id),
        eq(reviewRequests.orgId, session.orgId),
        eq(reviewRequests.status, 'requested'),
      ),
    );

  revalidatePath('/review-queue');
}

/** Put it back, without prejudice to the learner. */
export async function releaseReview(formData: FormData): Promise<void> {
  const { session, allowed } = await requireReviewer();
  if (!allowed) return;
  const parsed = reviewIdSchema.safeParse({ id: formData.get('id') });
  if (!parsed.success) return;

  await db
    .update(reviewRequests)
    .set({ status: 'requested', reviewerId: null, claimedAt: null })
    .where(
      and(
        eq(reviewRequests.id, parsed.data.id),
        eq(reviewRequests.orgId, session.orgId),
        eq(reviewRequests.reviewerId, session.userId),
      ),
    );

  revalidatePath('/review-queue');
}

/** Return the work with written feedback. */
export async function returnReview(formData: FormData): Promise<void> {
  const { session, allowed } = await requireReviewer();
  if (!allowed) return;

  const parsed = reviewReturnSchema.safeParse({
    id: formData.get('id'),
    feedback: formData.get('feedback'),
    reviewerLevel: formData.get('reviewerLevel') ?? '',
  });
  if (!parsed.success) return;

  await db
    .update(reviewRequests)
    .set({
      status: 'returned',
      feedback: parsed.data.feedback,
      reviewerLevel: parsed.data.reviewerLevel,
      returnedAt: Math.floor(Date.now() / 1000),
      reviewerId: session.userId,
    })
    .where(
      and(
        eq(reviewRequests.id, parsed.data.id),
        eq(reviewRequests.orgId, session.orgId),
        sql`${reviewRequests.status} <> 'returned'`,
      ),
    );

  await audit({
    orgId: session.orgId,
    actorId: session.userId,
    action: 'review.return',
    entityType: 'review_request',
    entityId: parsed.data.id,
  });

  revalidatePath('/review-queue');
}
