import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateWriting } from '../src/lib/engines/writing-eval';
import { evaluateSpeaking, segmentEnvelope } from '../src/lib/engines/speaking-eval';
import { runUsageRules } from '../src/lib/engines/usage-rules';
import { aggregateSkill, probabilityCorrect, updateBelief, targetDifficulty } from '../src/lib/engines/ability';
import { intervalForRetention, newCard, retrievability, review, interleave } from '../src/lib/engines/srs';
import { recommend, readiness } from '../src/lib/engines/recommend';
import { generatePlan } from '../src/lib/engines/plan';
import { cohesionProfile, lexicalProfile, sentences } from '../src/lib/engines/text';
import { MICRO_SKILLS, PART_TYPES, SECTION_BLUEPRINT, tryMicroSkill } from '../src/lib/content/taxonomy';
import { readingStimuli } from '../src/lib/content/seed/reading';
import { listeningStimuli } from '../src/lib/content/seed/listening';
import { validateStimulus } from '../src/lib/content/validate';

const emailTask = {
  taskType: 'writing.email',
  title: 'A delayed renovation',
  scenario: 'You hired a contractor to replace the flooring. The work has stalled.',
  instructions: 'Write an email explaining the situation and what you need.',
  requirements: [
    'Describe the current state of the work and how long it has been stalled',
    'Refer to the deposit you have already paid',
    'State the date by which the work must be finished and why that date matters',
    'Say what action you will take if the deadline is not met',
  ],
  choices: null,
  minWords: 150,
  maxWords: 200,
  register: 'formal' as const,
  timeLimitSeconds: 1620,
};

const strongResponse = `Dear Mr Alvarez,

I am writing about the flooring replacement at 14 Rosemount Avenue, which was scheduled to finish on the fourth of this month. The work is roughly half complete, and no one has attended the site for eight days.

I paid a deposit of fifty per cent on the third of last month, and that payment covered the materials and the first phase of labour, neither of which has been completed. Because a family member arrives on the twentieth and will be staying in the affected room, the work must be finished by the nineteenth at the latest.

If the flooring is not complete by that date, I will arrange for another contractor to finish it and will seek recovery of the difference from the deposit already paid. I would much prefer to avoid that, and I recognise that scheduling in this season is difficult.

Please confirm in writing by Friday whether your team will return this week.

Yours sincerely,
J. Okonkwo`;

const weakResponse = `Hi,

I want to talk about my floor. It is not finished. I paid you a lot of money and I am very angry about this situation. It is a very big problem for me.

Please can you finish it soon. Thanks in advance!`;

/* ------------------------------------------------------------------ */
/* Writing analyser                                                    */
/* ------------------------------------------------------------------ */

test('writing: a complete response has its content points recognised', () => {
  const result = evaluateWriting({ task: emailTask, text: strongResponse, elapsedSeconds: 1400, timed: true });
  const uncovered = result.requirementCoverage.filter((r) => !r.covered);
  assert.equal(
    uncovered.length,
    0,
    `expected full coverage, missed: ${uncovered.map((u) => u.requirement).join(' | ')}`,
  );
  assert.ok(result.estimatedLevel >= 9, `expected CLB 9+, got ${result.estimatedLevel}`);
});

test('writing: a weak response scores materially lower than a strong one', () => {
  const strong = evaluateWriting({ task: emailTask, text: strongResponse, elapsedSeconds: 1400, timed: true });
  const weak = evaluateWriting({ task: emailTask, text: weakResponse, elapsedSeconds: 400, timed: true });
  assert.ok(
    strong.estimatedLevel - weak.estimatedLevel >= 2,
    `expected a gap of 2+ levels, got ${strong.estimatedLevel} vs ${weak.estimatedLevel}`,
  );
});

test('writing: missing content caps the estimate however well it is written', () => {
  const partial = strongResponse.replace(/I paid a deposit[^]*?completed\. /, '');
  const result = evaluateWriting({ task: emailTask, text: partial, elapsedSeconds: 1400, timed: true });
  assert.ok(result.estimatedLevel <= 9.4, `cap not applied, got ${result.estimatedLevel}`);
});

test('writing: pacing is not reported when the clock did not run', () => {
  const result = evaluateWriting({ task: emailTask, text: strongResponse, elapsedSeconds: 0, timed: true });
  assert.ok(!result.dimensions.some((d) => d.microSkill === 'writing.exam_pacing'));
});

test('writing: register slips are found in a formal task and not invented in a strong one', () => {
  const weak = evaluateWriting({ task: emailTask, text: weakResponse, elapsedSeconds: 400, timed: true });
  const strong = evaluateWriting({ task: emailTask, text: strongResponse, elapsedSeconds: 1400, timed: true });
  assert.ok(weak.findings.some((f) => f.errorCode.startsWith('register.')));
  assert.equal(strong.findings.filter((f) => f.severity === 'high').length, 0);
});

test('writing: every dimension carries evidence a learner can check', () => {
  const result = evaluateWriting({ task: emailTask, text: strongResponse, elapsedSeconds: 1400, timed: true });
  for (const dimension of result.dimensions) {
    assert.ok(dimension.evidence.length > 0, `${dimension.microSkill} has no evidence`);
    assert.ok(dimension.note.length > 20, `${dimension.microSkill} has no teaching note`);
  }
  assert.ok(result.limitations.length >= 3);
});

/* ------------------------------------------------------------------ */
/* Usage rules                                                         */
/* ------------------------------------------------------------------ */

test('usage rules: catch the patterns they claim to catch', () => {
  const cases: [string, string][] = [
    ['We discussed about the timeline.', 'grammar.preposition.transitive'],
    ['Despite of the delay, we finished.', 'grammar.preposition.despite'],
    ['I need more informations.', 'grammar.noun.uncountable'],
    ['There is many reasons.', 'grammar.agreement.existential'],
    ['This option is more cheaper.', 'grammar.comparative.double'],
    ['Although it costs more, but the warranty helps.', 'grammar.clause.double_connector'],
    ['I would like to know when will the work be finished.', 'grammar.word_order.embedded_question'],
    ['I look forward to hear from you.', 'grammar.verb.gerund_after_to'],
  ];
  for (const [text, code] of cases) {
    const findings = runUsageRules(text, { formal: true, transcript: false });
    assert.ok(
      findings.some((f) => f.errorCode === code),
      `"${text}" did not produce ${code}`,
    );
  }
});

test('usage rules: do not fire on correct English', () => {
  const clean = [
    'We discussed the timeline in detail.',
    'Despite the delay, the work was completed on schedule.',
    'There are several reasons for the change.',
    'I look forward to hearing from you.',
    'Although the cost is higher, the warranty covers three years.',
    'I would like to know when the work will be finished.',
  ];
  for (const sentence of clean) {
    const findings = runUsageRules(sentence, { formal: true, transcript: false });
    const serious = findings.filter((f) => f.severity !== 'low');
    assert.equal(serious.length, 0, `false positive on "${sentence}": ${serious.map((f) => f.ruleId).join(', ')}`);
  }
});

test('usage rules: punctuation-dependent rules are skipped on transcripts', () => {
  const text = 'the renewal went through, however it was applied to the wrong plate';
  const written = runUsageRules(text, { formal: true, transcript: false });
  const spoken = runUsageRules(text, { formal: true, transcript: true });
  assert.ok(written.length >= spoken.length);
});

/* ------------------------------------------------------------------ */
/* Speaking analyser                                                   */
/* ------------------------------------------------------------------ */

function buildEnvelope(pattern: { speakMs: number; pauseMs: number }[]): { tMs: number; rms: number }[] {
  const out: { tMs: number; rms: number }[] = [];
  let t = 0;
  for (const segment of pattern) {
    for (let i = 0; i < segment.speakMs; i += 40) out.push({ tMs: t + i, rms: 0.08 });
    t += segment.speakMs;
    for (let i = 0; i < segment.pauseMs; i += 40) out.push({ tMs: t + i, rms: 0.001 });
    t += segment.pauseMs;
  }
  return out;
}

const speakingTask = {
  taskType: 'speaking.t1_advice',
  taskNumber: 1,
  title: 'Advice about a first car',
  prompt: 'Your cousin is choosing between a used car and a new car. Give advice.',
  successCriteria: [
    'Commits to one recommendation in the first two sentences',
    'Gives at least two reasons that connect to the situation',
    'Names a risk or drawback of the recommended option',
    'Ends with a concrete next step',
  ],
  prepSeconds: 30,
  speakSeconds: 90,
};

test('speaking: segmentation finds the pauses that are actually there', () => {
  const envelope = buildEnvelope([
    { speakMs: 4000, pauseMs: 1200 },
    { speakMs: 5000, pauseMs: 2000 },
    { speakMs: 3000, pauseMs: 0 },
  ]);
  const segments = segmentEnvelope(envelope, 15200);
  assert.equal(segments.pauses.length, 2);
  assert.ok(segments.longestPauseMs >= 1800, `longest pause ${segments.longestPauseMs}`);
  assert.ok(segments.speechMs > segments.silenceMs);
});

test('speaking: degrades honestly with no transcript', () => {
  const result = evaluateSpeaking({
    task: speakingTask,
    transcript: '',
    transcriptSource: 'none',
    durationMs: 80000,
    envelope: buildEnvelope([{ speakMs: 70000, pauseMs: 10000 }]),
  });
  assert.equal(result.transcriptQuality, 'none');
  assert.ok(result.dimensions.every((d) => d.microSkill.startsWith('speaking.')));
  assert.ok(result.dimensions.length <= 3, 'content dimensions must not be invented without words');
  assert.ok(result.levelSe >= 1.5, 'uncertainty must widen without a transcript');
  assert.ok(result.limitations.some((l) => l.toLowerCase().includes('pronunciation')));
});

test('speaking: a developed response outscores a thin one', () => {
  const envelope = buildEnvelope([{ speakMs: 85000, pauseMs: 3000 }]);
  const developed = evaluateSpeaking({
    task: speakingTask,
    transcript:
      'I would advise her to take the newer car with the warranty. The reason is simple: she drives forty kilometres a day, so a breakdown costs her a working day, not just a repair bill. For example, my brother bought an older car last year and spent two thousand dollars in the first six months. The drawback is a longer loan, which means less flexibility if her situation changes. So my advice would be to get the warranty and check the monthly payment against her budget first.',
    transcriptSource: 'manual',
    durationMs: 88000,
    envelope,
  });
  const thin = evaluateSpeaking({
    task: speakingTask,
    transcript: 'Um, I think maybe the new car is better. It is newer. Yeah, that is what I think, um, so yeah.',
    transcriptSource: 'manual',
    durationMs: 25000,
    envelope: buildEnvelope([{ speakMs: 20000, pauseMs: 5000 }]),
  });
  assert.ok(
    developed.estimatedLevel - thin.estimatedLevel >= 2,
    `expected a clear gap, got ${developed.estimatedLevel} vs ${thin.estimatedLevel}`,
  );
  assert.ok(thin.estimatedLevel <= 8.5, 'an unused window must cap the estimate');
});

/* ------------------------------------------------------------------ */
/* Ability estimation                                                  */
/* ------------------------------------------------------------------ */

test('ability: belief moves toward the evidence and tightens with it', () => {
  let belief = { theta: 7, se: 2.5 };
  for (let i = 0; i < 20; i++) belief = updateBelief(belief, 9, true);
  assert.ok(belief.theta > 8, `theta should rise, got ${belief.theta}`);
  assert.ok(belief.se < 1.2, `se should tighten, got ${belief.se}`);

  let falling = { theta: 10, se: 2.5 };
  for (let i = 0; i < 20; i++) falling = updateBelief(falling, 8, false);
  assert.ok(falling.theta < 9, `theta should fall, got ${falling.theta}`);
});

test('ability: probability and target difficulty are consistent', () => {
  assert.ok(Math.abs(probabilityCorrect(9, 9) - 0.5) < 1e-9);
  const target = targetDifficulty(9, 0.65);
  assert.ok(Math.abs(probabilityCorrect(9, target) - 0.65) < 0.01);
});

test('ability: unmeasured micro-skills do not drag the aggregate', () => {
  const estimate = aggregateSkill('reading', [
    { microSkill: 'reading.inference', skill: 'reading', theta: 10, se: 0.5, observations: 12, correct: 9, timedObservations: 12, timedCorrect: 9, avgSecondsRatio: 1 },
    { microSkill: 'reading.main_idea', skill: 'reading', theta: 0, se: 2.5, observations: 0, correct: 0, timedObservations: 0, timedCorrect: 0, avgSecondsRatio: 1 },
  ]);
  assert.ok(estimate.level > 9, `unmeasured skills must not pull the estimate down, got ${estimate.level}`);
  assert.ok(estimate.coverage < 1);
});

test('ability: readiness requires the lower bound to clear the target', () => {
  const skills = ['reading', 'listening', 'writing', 'speaking'].map((skill) => ({
    skill: skill as 'reading',
    level: 10.2,
    se: 0.9,
    observations: 30,
    weakest: [],
    strongest: [],
    timePressureGap: null,
    coverage: 1,
  }));
  assert.equal(readiness(skills, 10).ready, false, 'a point estimate above target is not readiness');
  const confident = skills.map((s) => ({ ...s, se: 0.15 }));
  assert.equal(readiness(confident, 10).ready, true);
});

/* ------------------------------------------------------------------ */
/* Spaced retrieval                                                    */
/* ------------------------------------------------------------------ */

test('srs: intervals grow on success and collapse on a lapse', () => {
  const now = 1_700_000_000;
  let card = newCard(now);
  card = review(card, 'good', now);
  const first = card.dueAt - now;
  const later = card.lastReviewedAt! + first;
  card = review(card, 'good', later);
  const second = card.dueAt - later;
  assert.ok(second > first, `interval should grow: ${first} → ${second}`);

  const lapsed = review(card, 'again', card.dueAt);
  assert.ok(lapsed.dueAt - card.dueAt < second, 'a lapse must shorten the interval');
  assert.equal(lapsed.lapses, 1);
});

test('srs: retrievability decays and the scheduled interval matches the target', () => {
  assert.ok(retrievability(0, 10) > 0.99);
  assert.ok(retrievability(100, 10) < 0.6);
  assert.ok(retrievability(1000, 10) < 0.25);
  const interval = intervalForRetention(10, 0.9);
  assert.ok(Math.abs(retrievability(interval, 10) - 0.9) < 0.01);
});

test('srs: interleaving avoids consecutive items from one skill', () => {
  const items = [
    { kind: 'question', skill: 'reading' },
    { kind: 'question', skill: 'reading' },
    { kind: 'question', skill: 'reading' },
    { kind: 'question', skill: 'listening' },
    { kind: 'question', skill: 'listening' },
  ];
  const mixed = interleave(items);
  let consecutive = 0;
  for (let i = 1; i < mixed.length; i++) if (mixed[i].skill === mixed[i - 1].skill) consecutive++;
  assert.ok(consecutive <= 1, `too much blocking: ${JSON.stringify(mixed.map((m) => m.skill))}`);
});

/* ------------------------------------------------------------------ */
/* Recommendations and planning                                        */
/* ------------------------------------------------------------------ */

const baseSkills = [
  { skill: 'reading' as const, level: 9, se: 0.5, observations: 40, weakest: [{ microSkill: 'reading.inference', theta: 7.5, se: 0.6, gapToSkill: 1.5 }], strongest: [], timePressureGap: null, coverage: 0.8 },
  { skill: 'listening' as const, level: 8, se: 0.6, observations: 30, weakest: [], strongest: [], timePressureGap: 1.4, coverage: 0.7 },
  { skill: 'writing' as const, level: 8.5, se: 0.8, observations: 3, weakest: [], strongest: [], timePressureGap: null, coverage: 0.5 },
  { skill: 'speaking' as const, level: 0, se: 2.5, observations: 0, weakest: [], strongest: [], timePressureGap: null, coverage: 0 },
];

test('recommend: the diagnostic comes first and nothing else does', () => {
  const result = recommend({
    targetLevel: 11,
    examDate: null,
    minutesAvailable: 45,
    skills: baseSkills,
    microEstimates: [],
    mistakes: [],
    dueReviewCount: 12,
    daysSincePractice: {},
    productiveCounts: { writing: 0, speaking: 0 },
    hasDiagnostic: false,
    now: 1_700_000_000,
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].kind, 'diagnostic');
});

test('recommend: every suggestion explains itself and the day is not monotonous', () => {
  const result = recommend({
    targetLevel: 11,
    examDate: null,
    minutesAvailable: 45,
    skills: baseSkills,
    microEstimates: [{ microSkill: 'reading.inference', skill: 'reading', theta: 7.5, se: 0.6, observations: 14 }],
    mistakes: [
      { errorCode: 'reading.inference.item', microSkill: 'reading.inference', skill: 'reading', summary: 'Over-reading inference options', occurrences: 4, lastSeenAt: 1_699_000_000, provedStreak: 0 },
    ],
    dueReviewCount: 8,
    daysSincePractice: { reading: 1, listening: 2, writing: 3, speaking: 40 },
    productiveCounts: { writing: 3, speaking: 0 },
    hasDiagnostic: true,
    now: 1_700_000_000,
  });
  assert.ok(result.length >= 3);
  for (const rec of result) {
    assert.ok(rec.rationale.length > 60, `thin rationale on ${rec.title}`);
    assert.ok(rec.href.startsWith('/'));
  }
  const counts = new Map<string, number>();
  for (const rec of result) counts.set(rec.skill, (counts.get(rec.skill) ?? 0) + 1);
  assert.ok([...counts.values()].every((c) => c <= 2), 'a day should not be all one skill');
});

test('plan: is blunt when the horizon cannot deliver the target', () => {
  const plan = generatePlan({
    horizonDays: 14,
    startDate: new Date('2026-01-05T00:00:00Z'),
    targetLevel: 12,
    minutesPerDay: 20,
    daysPerWeek: 3,
    skills: baseSkills,
    weakMicroSkills: [],
    examDate: null,
  });
  assert.equal(plan.projection.verdict, 'unrealistic');
  assert.ok(plan.days.some((d) => d.rest), 'rest days must be scheduled');
  assert.ok(plan.days.filter((d) => !d.rest).every((d) => d.blocks.some((b) => b.kind === 'review')));
});

test('plan: a test date produces a simulation and a taper', () => {
  const plan = generatePlan({
    horizonDays: 30,
    startDate: new Date('2026-01-05T00:00:00Z'),
    targetLevel: 10,
    minutesPerDay: 60,
    daysPerWeek: 5,
    skills: baseSkills,
    weakMicroSkills: [],
    examDate: '2026-01-25',
  });
  assert.ok(plan.days.some((d) => d.blocks.some((b) => b.kind === 'mock')));
  assert.ok(plan.days.some((d) => d.focus.startsWith('Taper')));
});

/* ------------------------------------------------------------------ */
/* Text primitives                                                     */
/* ------------------------------------------------------------------ */

test('text: sentence splitting survives abbreviations and quotes', () => {
  const text = 'Dr. Okafor called at 4 p.m. She said the work would finish on Friday. "Not before," she added.';
  assert.equal(sentences(text).length, 3);
});

test('text: cohesion counts reference links, not only repeated words', () => {
  const referenced = cohesionProfile(
    'I paid a deposit in March. That payment covered the materials. This means the first phase was funded.',
  );
  assert.ok(referenced.referenceLinks >= 2);
  assert.ok(referenced.linkedShare > 0.5);
});

test('text: lexical profile separates range from repetition', () => {
  const rich = lexicalProfile(
    'The consultation demonstrated considerable variation between neighbourhoods, and the discrepancy warrants further scrutiny.',
  );
  const plain = lexicalProfile('The thing was good. It was a good thing. Things are good and good things happen.');
  assert.ok(rich.midFrequencyShare > plain.midFrequencyShare);
  assert.ok(plain.overusedWords.some((w) => w.word === 'good' || w.word === 'thing'));
});

/* ------------------------------------------------------------------ */
/* Content integrity                                                   */
/* ------------------------------------------------------------------ */

test('content: every published item passes the validator', () => {
  for (const stimulus of [...readingStimuli, ...listeningStimuli]) {
    const result = validateStimulus(stimulus);
    const errors = result.findings.filter((f) => f.severity === 'error');
    assert.equal(errors.length, 0, `${stimulus.slug}: ${errors.map((e) => e.message).join('; ')}`);
  }
});

test('content: every question references a real micro-skill and a valid key', () => {
  for (const stimulus of [...readingStimuli, ...listeningStimuli]) {
    for (const question of stimulus.questions) {
      assert.ok(tryMicroSkill(question.microSkill), `${question.slug}: unknown micro-skill`);
      assert.ok(
        question.options.some((o) => o.key === question.answerKey),
        `${question.slug}: key not among the options`,
      );
      const marked = question.options.filter((o) => /^correct\b/i.test(o.rationale.trim()));
      assert.equal(marked.length, 1, `${question.slug}: ${marked.length} options claim to be correct`);
      assert.equal(marked[0].key, question.answerKey, `${question.slug}: key and rationale disagree`);
    }
  }
});

test('taxonomy: part types reference defined micro-skills and cover the blueprint', () => {
  for (const part of PART_TYPES) {
    for (const slug of part.microSkills) {
      assert.ok(tryMicroSkill(slug), `${part.slug} references unknown ${slug}`);
    }
  }
  for (const [skill, blueprint] of Object.entries(SECTION_BLUEPRINT)) {
    for (const partSlug of blueprint.parts) {
      assert.ok(
        PART_TYPES.some((p) => p.slug === partSlug),
        `${skill} blueprint references unknown part ${partSlug}`,
      );
    }
  }
  assert.ok(MICRO_SKILLS.length >= 40);
});

test('content: the corpus covers every part type in the blueprint', () => {
  const covered = new Set([...readingStimuli, ...listeningStimuli].map((s) => s.partType));
  for (const partSlug of [...SECTION_BLUEPRINT.reading.parts, ...SECTION_BLUEPRINT.listening.parts]) {
    assert.ok(covered.has(partSlug), `no published content for ${partSlug}`);
  }
});

/* ------------------------------------------------------------------ */
/* Authentication primitives                                           */
/* ------------------------------------------------------------------ */

test('password: hashes verify, wrong passwords do not, and salts differ', async () => {
  const { hashPassword, verifyPassword } = await import('../src/lib/auth/password');
  const hash = await hashPassword('a-real-passphrase-1');
  assert.ok(await verifyPassword('a-real-passphrase-1', hash));
  assert.equal(await verifyPassword('a-real-passphrase-2', hash), false);
  assert.equal(await verifyPassword('a-real-passphrase-1', 'not-a-hash'), false);

  const again = await hashPassword('a-real-passphrase-1');
  assert.notEqual(hash, again, 'each hash must carry its own salt');
});

test('password: the decoy hash is shaped exactly like a real one', async () => {
  const { decoyHash, hashPassword } = await import('../src/lib/auth/password');
  // The decoy exists so an unknown address costs the same time as a real one.
  // If its parameters or digest length drift from a real hash, verification
  // against it becomes cheaper and the timing signal returns.
  const decoy = (await decoyHash()).split('$');
  const real = (await hashPassword('any-passphrase-at-all')).split('$');

  assert.deepEqual(decoy.slice(0, 4), real.slice(0, 4), 'algorithm and cost parameters must match');
  assert.equal(
    Buffer.from(decoy[5], 'base64').length,
    Buffer.from(real[5], 'base64').length,
    'digest length must match, or the decoy verification is cheaper',
  );
  assert.equal(Buffer.from(decoy[4], 'base64').length, Buffer.from(real[4], 'base64').length);
});

test('password: the weak-password check rejects and accepts as documented', async () => {
  const { passwordProblems } = await import('../src/lib/auth/password');
  assert.ok(passwordProblems('short1!').length);
  assert.ok(passwordProblems('alllettersonly').some((p) => p.includes('number')));
  assert.ok(passwordProblems('my-password-123').some((p) => p.includes('guess')));
  assert.equal(passwordProblems('quiet-harbour-49').length, 0);
});
