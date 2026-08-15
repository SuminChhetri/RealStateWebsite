import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSelfReview, type SelfReviewInput } from '../src/lib/practice/self-review';

/**
 * The self-review protocol is what a self-serve learner gets where an
 * institution would get a teacher. Its whole value is that the questions are
 * specific and answerable from the learner's own response — a protocol that
 * degrades into "check your work" is worse than nothing, because it occupies
 * the slot where real work would go.
 */

const base: SelfReviewInput = {
  kind: 'writing',
  coverage: [
    { requirement: 'State what you paid and when', covered: true },
    { requirement: 'Name a deadline', covered: false },
    { requirement: 'Say what you will do if it is missed', covered: false },
  ],
  dimensions: [
    { label: 'Development', level: 7.5, note: 'Claims are asserted rather than supported.' },
    { label: 'Organisation', level: 9.5, note: 'Paragraphs each do one job.' },
    { label: 'Accuracy', level: 9, note: 'Few errors, none impeding.' },
  ],
  priorities: [{ title: 'Support each claim once', how: 'Add a because-clause to your second paragraph.' }],
  modelNotes: 'A strong response names the consequence before the deadline, not after it.',
  estimatedLevel: 8,
  targetLevel: 11,
};

test('an uncovered requirement becomes a question that can only be answered by quoting', () => {
  const review = buildSelfReview(base);
  const pass = review.passes.find((p) => p.key === 'requirements');
  assert.ok(pass);
  assert.equal(pass.questions.length, 2, 'one question per uncovered requirement');
  for (const requirement of ['Name a deadline', 'Say what you will do if it is missed']) {
    assert.ok(
      pass.questions.some((q) => q.includes(requirement)),
      `${requirement} should be named verbatim, not summarised`,
    );
  }
  // The instruction that makes it work: you cannot answer this from memory.
  assert.ok(pass.questions.every((q) => q.toLowerCase().includes('quote')));
});

test('when everything is covered the pass changes its question rather than disappearing', () => {
  const review = buildSelfReview({
    ...base,
    coverage: base.coverage.map((c) => ({ ...c, covered: true })),
  });
  const pass = review.passes.find((p) => p.key === 'requirements');
  assert.ok(pass, 'present and answered are different things, and the second is what is marked');
  assert.equal(pass.questions.length, 3);
  assert.ok(pass.title.toLowerCase().includes('not just mentioned'));
});

test('the weakest dimension is chosen by measurement, not by order', () => {
  const review = buildSelfReview(base);
  const pass = review.passes.find((p) => p.key === 'weakest');
  assert.ok(pass);
  assert.ok(pass.title.includes('development'), 'Development scored 7.5, the lowest');
  assert.ok(pass.rationale.includes('7.5'), 'the number is shown, not just the claim');
  assert.ok(
    pass.rationale.includes('Claims are asserted rather than supported.'),
    'the dimension carries its own measured note into the pass',
  );
});

test('the reader pass differs for writing and speaking, because the act does', () => {
  const writing = buildSelfReview(base).passes.find((p) => p.key === 'reader');
  const speaking = buildSelfReview({ ...base, kind: 'speaking' }).passes.find((p) => p.key === 'reader');
  assert.ok(writing && speaking);
  assert.ok(writing.title.toLowerCase().includes('aloud'));
  assert.ok(speaking.title.toLowerCase().includes('listen'));
  // Speech gets the pause question; text cannot have one.
  assert.ok(speaking.questions.some((q) => q.toLowerCase().includes('pause')));
  assert.ok(!writing.questions.some((q) => q.toLowerCase().includes('pause')));
});

test('the protocol always ends in a rewrite, never in praise', () => {
  for (const kind of ['writing', 'speaking'] as const) {
    const review = buildSelfReview({ ...base, kind });
    assert.ok(review.close.toLowerCase().includes('again'), 'the close sends them back to the task');
    assert.ok(!/well done|great job|nice work/i.test(review.close));
  }
});

test('the gap to target is stated when there is one, and not invented when there is not', () => {
  const behind = buildSelfReview({ ...base, estimatedLevel: 8, targetLevel: 11 });
  assert.ok(behind.close.includes('3.0'));

  const level = buildSelfReview({ ...base, estimatedLevel: 11, targetLevel: 11 });
  assert.ok(!/\d\.\d below/.test(level.close), 'no gap should be reported when there is none');

  const ahead = buildSelfReview({ ...base, estimatedLevel: 12, targetLevel: 9 });
  assert.ok(!ahead.close.includes('-'), 'a negative gap must never be printed as a gap');
});

test('missing inputs drop their pass rather than producing an empty one', () => {
  const bare = buildSelfReview({
    ...base,
    coverage: [],
    dimensions: [],
    priorities: [],
    modelNotes: null,
  });
  assert.equal(bare.passes.length, 1, 'only the reader pass survives, and it needs no data');
  assert.equal(bare.passes[0].key, 'reader');
  // Every pass that does render must carry something to do.
  for (const pass of bare.passes) {
    assert.ok(pass.questions.length > 0);
    assert.ok(pass.rationale.length > 40, 'a rationale should say why, not just label the pass');
  }
});

test('no pass ever asserts a judgement about the response', () => {
  const review = buildSelfReview(base);
  const everything = review.passes
    .flatMap((p) => [p.title, p.rationale, ...p.questions])
    .concat(review.close)
    .join(' ');
  // The protocol asks; it does not score. If any of these ever appear, it has
  // started impersonating a reader rather than prompting one.
  for (const phrase of ['your response is', 'this is a CLB', 'we think', 'our analysis suggests']) {
    assert.ok(!everything.toLowerCase().includes(phrase), `"${phrase}" is a judgement, not a question`);
  }
});
