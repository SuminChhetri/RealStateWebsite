import { z } from 'zod';

/**
 * What counts as a valid review request, claim and return.
 *
 * These live apart from the server actions so they can be exercised without a
 * database or a session. The rules they encode are product decisions, not
 * plumbing — particularly the minimum length of a teacher's feedback, which is
 * the difference between a coached path and a paid "looks good".
 */

/** A learner asks a person to look at a piece of work. */
export const reviewRequestSchema = z.object({
  submissionType: z.enum(['writing', 'speaking']),
  submissionId: z.string().min(1).max(64),
  // Optional, because insisting on a question would mean learners inventing one.
  // Capped, because a question longer than this is a second submission.
  question: z.string().trim().max(600).optional(),
});

export const reviewIdSchema = z.object({ id: z.string().min(1).max(64) });

/**
 * Returning work.
 *
 * The 20-character floor is deliberate and load-bearing. "Good job" and "Nice
 * work" are what an unenforced field fills up with, and a learner who paid for
 * human review and received four words has been sold nothing. It is a floor,
 * not a target: it stops the empty case without pretending to measure quality.
 *
 * The band is optional. A reviewer who is not confident enough to place a
 * response should be able to say something useful without inventing a number,
 * and an invented number would be worse than none — it is shown to the learner
 * beside a measured estimate.
 */
export const reviewReturnSchema = z.object({
  id: z.string().min(1).max(64),
  feedback: z.string().trim().min(20, 'Write something the learner can act on').max(4000),
  reviewerLevel: z
    .union([z.literal(''), z.coerce.number().min(4).max(12)])
    .optional()
    .transform((value) => (value === '' || value === undefined ? null : Number(value))),
});

/** How many reviews one learner may ask for in a day. */
export const REVIEW_REQUESTS_PER_DAY = 20;
