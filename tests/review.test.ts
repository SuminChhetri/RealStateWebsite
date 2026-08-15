import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  REVIEW_REQUESTS_PER_DAY,
  reviewIdSchema,
  reviewRequestSchema,
  reviewReturnSchema,
} from '../src/lib/practice/review-rules';
import { isReviewerOnlyRole, isReviewerRole } from '../src/lib/practice/review-access';
import { PLANS, hasFeature, planRequiredFor } from '../src/lib/billing/plans';

/**
 * The coached path is the one feature whose value is a person's time. Which
 * means the rules that decide who may see whose work, and what counts as having
 * actually reviewed something, are the product — not validation trivia.
 */

test('only reviewing roles may reach other people’s work', () => {
  for (const role of ['teacher', 'reviewer', 'admin', 'owner']) {
    assert.equal(isReviewerRole(role), true, `${role} should be able to review`);
  }
  // A learner must never be able to open the queue, whatever the plan says.
  assert.equal(isReviewerRole('learner'), false);
  assert.equal(isReviewerRole(''), false);
  assert.equal(isReviewerRole('Teacher'), false, 'role matching is exact, not case-insensitive');
});

test('owners are not treated as reviewers-only, because every learner owns their own org', () => {
  assert.equal(isReviewerOnlyRole('teacher'), true);
  assert.equal(isReviewerOnlyRole('reviewer'), true);
  // If this flipped, an individual learner would skip onboarding and land on an
  // empty plan with no way back into it.
  assert.equal(isReviewerOnlyRole('owner'), false);
  assert.equal(isReviewerOnlyRole('admin'), false);
  assert.equal(isReviewerOnlyRole('learner'), false);
});

test('human review is a paid feature and the free tier does not pretend otherwise', () => {
  assert.ok(PLANS.some((plan) => plan.key === 'learner_free'));
  assert.equal(hasFeature('learner_free', 'teacher_review'), false);
  const required = planRequiredFor('teacher_review');
  assert.ok(required, 'some plan must actually offer it, or the feature is a lie');
  assert.equal(hasFeature(required.key, 'teacher_review'), true);
  assert.equal(required.audience, 'organisation', 'a review queue needs an organisation with reviewers in it');
});

/* ---------------- asking ---------------- */

test('a request names a submission of a kind a person can actually review', () => {
  const ok = reviewRequestSchema.safeParse({
    submissionType: 'writing',
    submissionId: 'wsb_abc',
    question: 'Does my second paragraph answer the question?',
  });
  assert.equal(ok.success, true);

  // Reading is machine-marked; there is nothing for a teacher to judge.
  assert.equal(
    reviewRequestSchema.safeParse({ submissionType: 'reading', submissionId: 'x' }).success,
    false,
  );
  assert.equal(reviewRequestSchema.safeParse({ submissionType: 'writing', submissionId: '' }).success, false);
});

test('the question is optional but bounded', () => {
  const none = reviewRequestSchema.safeParse({ submissionType: 'speaking', submissionId: 'ssb_1' });
  assert.equal(none.success, true);
  assert.equal(none.success && none.data.question, undefined);

  const padded = reviewRequestSchema.safeParse({
    submissionType: 'speaking',
    submissionId: 'ssb_1',
    question: '   trimmed   ',
  });
  assert.equal(padded.success && padded.data.question, 'trimmed');

  // Past this length it is a second submission, not a question about the first.
  assert.equal(
    reviewRequestSchema.safeParse({
      submissionType: 'speaking',
      submissionId: 'ssb_1',
      question: 'x'.repeat(601),
    }).success,
    false,
  );
});

test('a submission id cannot be an unbounded string', () => {
  assert.equal(reviewIdSchema.safeParse({ id: 'rvq_1' }).success, true);
  assert.equal(reviewIdSchema.safeParse({ id: '' }).success, false);
  assert.equal(reviewIdSchema.safeParse({ id: 'x'.repeat(65) }).success, false);
});

test('the daily request cap is a real number, not an accident', () => {
  assert.ok(REVIEW_REQUESTS_PER_DAY > 0);
  // Low enough to stop one learner emptying a teacher's day, high enough that a
  // learner working hard never meets it.
  assert.ok(REVIEW_REQUESTS_PER_DAY >= 10 && REVIEW_REQUESTS_PER_DAY <= 50);
});

/* ---------------- returning ---------------- */

test('a returned review has to say something', () => {
  // The failure mode this exists to prevent: a paid review that says "Good job".
  for (const attempt of ['', '   ', 'Good job', 'Nice work!', 'ok']) {
    assert.equal(
      reviewReturnSchema.safeParse({ id: 'rvq_1', feedback: attempt, reviewerLevel: '' }).success,
      false,
      `"${attempt}" should not count as feedback`,
    );
  }

  const real = reviewReturnSchema.safeParse({
    id: 'rvq_1',
    feedback: 'Your second paragraph restates the first rather than developing it. Name the consequence.',
    reviewerLevel: '',
  });
  assert.equal(real.success, true);
});

test('feedback is trimmed before it is measured, so whitespace cannot pass the floor', () => {
  const spaces = reviewReturnSchema.safeParse({
    id: 'rvq_1',
    feedback: `Good job${' '.repeat(40)}`,
    reviewerLevel: '',
  });
  assert.equal(spaces.success, false);
});

test('the reviewer’s band is optional, and absent means absent rather than zero', () => {
  const blank = reviewReturnSchema.safeParse({
    id: 'rvq_1',
    feedback: 'A specific, actionable sentence about the response.',
    reviewerLevel: '',
  });
  assert.equal(blank.success, true);
  // null, not 0: a missing judgement must never render as "CLB 0.0".
  assert.equal(blank.success && blank.data.reviewerLevel, null);

  const missing = reviewReturnSchema.safeParse({
    id: 'rvq_1',
    feedback: 'A specific, actionable sentence about the response.',
  });
  assert.equal(missing.success && missing.data.reviewerLevel, null);
});

test('a band outside the scale is rejected rather than clamped', () => {
  const body = { id: 'rvq_1', feedback: 'A specific, actionable sentence about the response.' };
  for (const level of ['3', '13', '0', '-5']) {
    assert.equal(
      reviewReturnSchema.safeParse({ ...body, reviewerLevel: level }).success,
      false,
      `CLB ${level} is not on the scale`,
    );
  }
  for (const level of ['4', '9.5', '12']) {
    const parsed = reviewReturnSchema.safeParse({ ...body, reviewerLevel: level });
    assert.equal(parsed.success, true, `CLB ${level} is on the scale`);
    assert.equal(parsed.success && parsed.data.reviewerLevel, Number(level));
  }
});

test('a very long review is rejected rather than silently truncated', () => {
  const parsed = reviewReturnSchema.safeParse({
    id: 'rvq_1',
    feedback: 'x'.repeat(4001),
    reviewerLevel: '',
  });
  // Truncating would lose the end of a teacher's paragraph without telling them.
  assert.equal(parsed.success, false);
});
