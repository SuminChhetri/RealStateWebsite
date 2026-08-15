import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FREE_FEATURES,
  PLANS,
  hasFeature,
  planFor,
  planRequiredFor,
  upgradeIsRelevant,
} from '../src/lib/billing/plans';
import { buildReadinessReport } from '../src/lib/engines/readiness-report';
import { buildSittingReport, compareEstimates } from '../src/lib/engines/sitting-report';

/**
 * The tier boundaries are a product promise, not a configuration detail. These
 * tests exist so that a future change which quietly moves something behind the
 * paywall fails loudly instead.
 */

test('the whole learning loop is free, permanently', () => {
  // If any of these ever needs a paid plan, the free tier has stopped being a
  // product and become a trial. See docs/MONETISATION.md, rule 2.
  for (const feature of [
    'diagnostic',
    'practice',
    'feedback',
    'mistakes',
    'review',
    'lessons',
    'evaluation',
    'plan',
    'mock',
    'progress',
  ] as const) {
    assert.ok(hasFeature('learner_free', feature), `${feature} must stay free`);
  }
});

test('data export is free on every plan', () => {
  // Rule 4: someone's own record is theirs.
  for (const plan of PLANS) {
    assert.ok(plan.features.includes('data_export'), `${plan.key} must include data_export`);
  }
});

test('an unknown or missing plan key falls back to the free plan, never to a paid one', () => {
  assert.equal(planFor(undefined).key, 'learner_free');
  assert.equal(planFor(null).key, 'learner_free');
  assert.equal(planFor('nonsense').key, 'learner_free');
  // The dangerous inverse: a bad key must not grant paid features.
  assert.equal(hasFeature('nonsense', 'readiness_report'), false);
});

test('paid features are actually gated, and name the plan that includes them', () => {
  for (const feature of ['readiness_report', 'sitting_report', 'calendar_export'] as const) {
    assert.equal(hasFeature('learner_free', feature), false, `${feature} should not be free`);
    assert.equal(planRequiredFor(feature)?.key, 'learner_pro');
  }
});

test('every paid plan is a superset of free — upgrading never removes anything', () => {
  for (const plan of PLANS) {
    for (const free of FREE_FEATURES) {
      assert.ok(plan.features.includes(free), `${plan.key} is missing ${free}`);
    }
  }
});

test('the upgrade prompt is contextual, not permanent', () => {
  // Someone in their first week is the wrong person to sell to.
  assert.equal(
    upgradeIsRelevant({ planKey: 'learner_free', daysToExam: null, completedSets: 1 }),
    false,
  );
  // A booked test inside the window is the moment the artefacts are worth something.
  assert.equal(
    upgradeIsRelevant({ planKey: 'learner_free', daysToExam: 30, completedSets: 1 }),
    true,
  );
  // And it never shows to someone who already has the feature.
  assert.equal(
    upgradeIsRelevant({ planKey: 'learner_pro', daysToExam: 7, completedSets: 40 }),
    false,
  );
});

/* ------------------------------------------------------------------ */
/* The readiness verdict                                               */
/* ------------------------------------------------------------------ */

function profileWith(skills: { skill: string; level: number; se: number; observations: number }[]) {
  return {
    targetLevel: 9,
    daysToExam: 30,
    skills: skills.map((s) => ({
      skill: s.skill,
      level: s.level,
      se: s.se,
      observations: s.observations,
      weakest: [],
      strongest: [],
      timePressureGap: null,
      coverage: 0.8,
    })),
  } as never;
}

test('a verdict is refused when the evidence is thin, rather than manufactured', () => {
  const report = buildReadinessReport(
    profileWith([{ skill: 'reading', level: 9.5, se: 0.2, observations: 5 }]),
  );
  assert.equal(report.verdict, 'insufficient');
  assert.match(report.reasoning, /evidence|items/i);
});

test('readiness uses the lower bound, so a wide band at target is not "ready"', () => {
  // Point estimate is above target; the interval is not. That distinction is
  // the whole reason this product reports uncertainty.
  const wide = buildReadinessReport(
    profileWith([
      { skill: 'reading', level: 9.2, se: 0.9, observations: 40 },
      { skill: 'listening', level: 9.3, se: 0.9, observations: 40 },
      { skill: 'writing', level: 9.4, se: 0.9, observations: 40 },
    ]),
  );
  assert.notEqual(wide.verdict, 'ready');

  const tight = buildReadinessReport(
    profileWith([
      { skill: 'reading', level: 9.8, se: 0.2, observations: 60 },
      { skill: 'listening', level: 10.1, se: 0.2, observations: 60 },
      { skill: 'writing', level: 9.9, se: 0.2, observations: 60 },
    ]),
  );
  assert.equal(tight.verdict, 'ready');
});

test('a clearly weak skill produces "below target" and names it', () => {
  const report = buildReadinessReport(
    profileWith([
      { skill: 'reading', level: 6.0, se: 0.3, observations: 50 },
      { skill: 'listening', level: 9.9, se: 0.2, observations: 50 },
      { skill: 'writing', level: 9.9, se: 0.2, observations: 50 },
    ]),
  );
  assert.equal(report.verdict, 'not-ready');
  assert.match(report.headline, /Reading/);
});

test('no verdict ever claims to predict an official result', () => {
  const reports = [
    buildReadinessReport(profileWith([{ skill: 'reading', level: 9.9, se: 0.2, observations: 60 }])),
    buildReadinessReport(
      profileWith([
        { skill: 'reading', level: 9.9, se: 0.2, observations: 60 },
        { skill: 'listening', level: 9.9, se: 0.2, observations: 60 },
        { skill: 'writing', level: 9.9, se: 0.2, observations: 60 },
      ]),
    ),
  ];
  for (const report of reports) {
    const text = `${report.headline} ${report.reasoning}`;
    assert.doesNotMatch(text, /you will (pass|score|get)/i, 'must not predict an outcome');
    assert.doesNotMatch(text, /guarantee/i, 'must not guarantee anything');
    assert.doesNotMatch(text, /official/i, 'must not imply official standing');
  }
});

/* ------------------------------------------------------------------ */
/* Sitting analysis                                                    */
/* ------------------------------------------------------------------ */

test('movement smaller than the combined uncertainty is reported as noise', () => {
  // The whole honesty claim of the comparison feature. A learner pleased with
  // a jump has to be told when the jump is measurement error.
  const noise = compareEstimates({
    label: 'Reading',
    before: { level: 7.0, se: 0.8 },
    after: { level: 7.9, se: 0.8 },
  });
  assert.equal(noise.kind, 'noise');
  assert.match(noise.explanation, /noise|inside/i);

  // Same delta, far tighter estimates — now it is real.
  const real = compareEstimates({
    label: 'Reading',
    before: { level: 7.0, se: 0.2 },
    after: { level: 7.9, se: 0.2 },
  });
  assert.equal(real.kind, 'improved');

  const decline = compareEstimates({
    label: 'Reading',
    before: { level: 8.5, se: 0.2 },
    after: { level: 7.2, se: 0.2 },
  });
  assert.equal(decline.kind, 'declined');
});

function item(over: Partial<Parameters<typeof buildSittingReport>[0]['items'][number]> = {}) {
  return {
    orderIndex: 0,
    correct: true,
    elapsedMs: 50_000,
    targetSeconds: 50,
    difficulty: 7,
    microSkill: 'reading.inference',
    partType: 'reading.information',
    changedAnswer: false,
    flagged: false,
    answered: true,
    ...over,
  };
}

test('a sitting report never invents a finding when nothing stands out', () => {
  const report = buildSittingReport({
    items: Array.from({ length: 12 }, (_, i) => item({ orderIndex: i })),
    timeLimitSeconds: 600,
    ability: 7,
  });
  assert.equal(report.findings.length, 1);
  assert.equal(report.findings[0].key, 'clean');
});

test('unanswered items are called out, because a blank is never better than a guess', () => {
  const report = buildSittingReport({
    items: [
      ...Array.from({ length: 8 }, (_, i) => item({ orderIndex: i })),
      ...Array.from({ length: 3 }, (_, i) => item({ orderIndex: 8 + i, answered: false, correct: null, elapsedMs: 0 })),
    ],
    timeLimitSeconds: 600,
    ability: 7,
  });
  const finding = report.findings.find((f) => f.key === 'unanswered');
  assert.ok(finding, 'unanswered items must be reported');
  assert.equal(report.unanswered, 3);
  assert.equal(finding!.severity, 'critical');
});

test('a fade across the sitting is detected from position, not from difficulty', () => {
  // Identical difficulty throughout; only the position changes.
  const items = [
    ...Array.from({ length: 6 }, (_, i) => item({ orderIndex: i, correct: true })),
    ...Array.from({ length: 6 }, (_, i) => item({ orderIndex: 6 + i, correct: true })),
    ...Array.from({ length: 6 }, (_, i) => item({ orderIndex: 12 + i, correct: false })),
  ];
  const report = buildSittingReport({ items, timeLimitSeconds: 900, ability: 7 });
  assert.ok(report.findings.some((f) => f.key === 'fade'), 'should notice accuracy falling across the sitting');
});

test('losses on items below the learner’s level are flagged as the cheapest marks', () => {
  const report = buildSittingReport({
    items: Array.from({ length: 10 }, (_, i) =>
      // Difficulty well below ability, so probability correct is high.
      item({ orderIndex: i, difficulty: 3, correct: i < 5 }),
    ),
    timeLimitSeconds: 600,
    ability: 9,
  });
  assert.ok(report.findings.some((f) => f.key === 'easy-losses'));
});

test('pace findings describe the measurement, not the learner’s state of mind', () => {
  const slow = buildSittingReport({
    items: Array.from({ length: 10 }, (_, i) => item({ orderIndex: i, elapsedMs: 100_000 })),
    timeLimitSeconds: 600,
    ability: 7,
  });
  const finding = slow.findings.find((f) => f.key === 'slow');
  assert.ok(finding);
  for (const f of slow.findings) {
    const text = `${f.title} ${f.detail}`;
    assert.doesNotMatch(text, /you (lost|were) (concentration|tired|distracted)/i);
    assert.doesNotMatch(text, /panic|lazy|careless/i);
  }
});
