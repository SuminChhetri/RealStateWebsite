import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  Rng,
  blank,
  clozeCandidates,
  generateBatch,
  generateLexicalItem,
  generateScheduleStimulus,
  generateUsageItem,
} from '../src/lib/content/generate';
import { validateQuestion, validateStimulus } from '../src/lib/content/validate';
import { vocabulary } from '../src/lib/content/seed/vocabulary';
import { grammarPoints } from '../src/lib/content/seed/grammar';
import { tryMicroSkill } from '../src/lib/content/taxonomy';

/**
 * The generated half of the bank is held to the same standard as the authored
 * half, so it is tested against the same validator. A generator that can emit an
 * item with an undefendable key is worse than no generator: it puts wrong
 * feedback in front of a learner who trusts it.
 */

const SEEDS = Array.from({ length: 60 }, (_, i) => `test-seed-${i}`);

test('the RNG is deterministic and stays in range', () => {
  const a = new Rng('same');
  const b = new Rng('same');
  for (let i = 0; i < 100; i++) {
    const value = a.next();
    assert.equal(value, b.next());
    assert.ok(value >= 0 && value < 1);
  }
  const rng = new Rng('bounds');
  for (let i = 0; i < 200; i++) {
    const n = rng.int(3, 7);
    assert.ok(n >= 3 && n <= 7, `int out of range: ${n}`);
  }
});

test('sample never returns duplicates or more than it was given', () => {
  const rng = new Rng('sample');
  const pool = ['a', 'b', 'c', 'd'];
  for (let i = 0; i < 50; i++) {
    const picked = rng.sample(pool, 3);
    assert.equal(picked.length, 3);
    assert.equal(new Set(picked).size, 3);
    assert.deepEqual(rng.sample(pool, 99).length, 4);
  }
});

test('every generated schedule set passes the content validator', () => {
  let produced = 0;
  for (const seed of SEEDS) {
    const stimulus = generateScheduleStimulus(seed, 5);
    if (!stimulus) continue; // a refusal is a valid outcome
    produced++;

    const result = validateStimulus(stimulus);
    const errors = result.findings.filter((f) => f.severity === 'error');
    assert.deepEqual(errors, [], `${seed}: ${errors.map((e) => e.message).join('; ')}`);

    assert.ok(stimulus.questions.length >= 3, `${seed}: too few questions`);
    assert.ok(stimulus.figure, `${seed}: no table`);
    for (const row of stimulus.figure!.rows) {
      assert.equal(row.length, stimulus.figure!.columns.length, `${seed}: ragged table row`);
    }
  }
  assert.ok(produced >= SEEDS.length * 0.6, `only ${produced}/${SEEDS.length} seeds produced a set`);
});

test('generated items answer to real micro-skills and have exactly one key', () => {
  for (const seed of SEEDS.slice(0, 25)) {
    const stimulus = generateScheduleStimulus(seed, 5);
    if (!stimulus) continue;
    for (const question of stimulus.questions) {
      assert.ok(tryMicroSkill(question.microSkill), `unknown micro-skill ${question.microSkill}`);
      assert.ok(
        question.options.some((o) => o.key === question.answerKey),
        'answer key matches no option',
      );
      const claimingCorrect = question.options.filter((o) => /^correct\b/i.test(o.rationale.trim()));
      assert.equal(claimingCorrect.length, 1, 'exactly one option should read as the key');
      assert.equal(
        claimingCorrect[0].key,
        question.answerKey,
        'the option that reads as the key must be the key',
      );
    }
  }
});

test('the key is not always in the same position', () => {
  const positions = new Set<string>();
  for (const seed of SEEDS) {
    const stimulus = generateScheduleStimulus(seed, 5);
    if (!stimulus) continue;
    for (const question of stimulus.questions) positions.add(question.answerKey);
  }
  assert.ok(positions.size >= 3, `keys only ever landed at ${[...positions].join(', ')}`);
});

test('generation is reproducible from its seed', () => {
  const first = generateScheduleStimulus('repeat-me', 5);
  const second = generateScheduleStimulus('repeat-me', 5);
  assert.deepEqual(first, second);
});

test('a cloze blank removes the headword and nothing else', () => {
  const usable = clozeCandidates(vocabulary);
  assert.ok(usable.length >= 40, `only ${usable.length} entries can be blanked`);

  for (const entry of usable) {
    const result = blank(entry)!;
    assert.ok(result.text.includes('______'), `${entry.headword}: no blank inserted`);
    assert.equal(
      result.text.split('______').length - 1,
      1,
      `${entry.headword}: more than one blank`,
    );
    assert.ok(
      result.removed.toLowerCase().startsWith(entry.headword.toLowerCase().slice(0, 3)),
      `${entry.headword}: removed "${result.removed}", which is not a form of the headword`,
    );
  }
});

test('vocabulary items validate and never repeat an option', () => {
  for (const [i, seed] of SEEDS.entries()) {
    const item = generateLexicalItem(vocabulary, seed, i);
    if (!item) continue;
    const errors = validateQuestion(item, '').findings.filter((f) => f.severity === 'error');
    assert.deepEqual(errors, [], `${seed}: ${errors.map((e) => e.message).join('; ')}`);

    const texts = item.options.map((o) => o.text);
    assert.equal(new Set(texts).size, texts.length, `${seed}: duplicate options`);
    // The blanked word must not be sitting in the prompt as a giveaway.
    const key = item.options.find((o) => o.key === item.answerKey)!;
    assert.ok(!item.prompt.toLowerCase().includes(` ${key.text.toLowerCase()} `), 'key appears in the prompt');
  }
});

test('usage items validate and draw distractors from other rules', () => {
  for (const [i, seed] of SEEDS.entries()) {
    const item = generateUsageItem(grammarPoints, seed, i);
    assert.ok(item, `${seed}: no item produced from ${grammarPoints.length} grammar points`);
    const errors = validateQuestion(item!, '').findings.filter((f) => f.severity === 'error');
    assert.deepEqual(errors, [], `${seed}: ${errors.map((e) => e.message).join('; ')}`);
    assert.equal(item!.options.length, 4);
  }
});

test('a batch produces material and every piece of it is publishable', () => {
  const batch = generateBatch('batch-seed', 4);
  assert.ok(batch.stimuli.length >= 2, 'batch produced almost no stimuli');
  assert.ok(batch.standalone.length >= 8, 'batch produced almost no standalone items');

  for (const stimulus of batch.stimuli) {
    assert.ok(validateStimulus(stimulus).passed, `${stimulus.slug} would be held in review`);
  }
  for (const question of batch.standalone) {
    assert.ok(validateQuestion(question, '').passed, `${question.slug} would be held in review`);
  }
});

test('slugs are unique across a batch, so nothing overwrites anything', () => {
  const batch = generateBatch('unique-seed', 4);
  const slugs = [
    ...batch.stimuli.flatMap((s) => [s.slug, ...s.questions.map((q) => q.slug)]),
    ...batch.standalone.map((q) => q.slug),
  ];
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slugs in one batch');
});

test('two different seeds do not produce the same material', () => {
  const a = generateBatch('seed-a', 3);
  const b = generateBatch('seed-b', 3);
  const aSlugs = new Set(a.stimuli.map((s) => s.slug));
  const overlap = b.stimuli.filter((s) => aSlugs.has(s.slug));
  assert.deepEqual(overlap, [], 'different seeds collided');
});
