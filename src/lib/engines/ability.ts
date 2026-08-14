/**
 * Ability estimation.
 *
 * Micro-skill mastery is tracked as a normally-distributed belief about the
 * learner's level on the CLB scale, updated after each observation with a
 * Rasch-style response model. This is a small, well-understood psychometric
 * model, chosen deliberately over anything heavier: with the item volumes a
 * single learner produces, a 1-parameter model estimated with a Kalman-style
 * update is both more stable and more explainable than a fitted 2PL/3PL.
 *
 * Two properties matter for the product:
 *  1. Uncertainty is first-class. `se` shrinks with evidence, so the UI can
 *     say "not enough evidence yet" instead of inventing confidence.
 *  2. Timed and untimed observations are tracked separately, which is what
 *     lets Meridian identify the learner who knows the material but collapses
 *     under exam conditions.
 */
import { clamp, round } from './text';
import { MICRO_SKILLS, tryMicroSkill, type Domain } from '../content/taxonomy';

/** Logistic slope on the CLB scale: ~1.1 levels per logit. */
const SCALE = 1.15;
const PRIOR_SE = 2.5;
const MIN_SE = 0.35;

export function probabilityCorrect(theta: number, difficulty: number): number {
  return 1 / (1 + Math.exp(-(theta - difficulty) / SCALE));
}

export interface AbilityBelief {
  theta: number;
  se: number;
}

/**
 * One Bayesian update. `difficulty` is the item's calibrated level on the CLB
 * scale; `correct` is the observation. Returns the posterior belief.
 */
/**
 * `weight` scales how much this single observation is allowed to move the
 * belief, and it is the statistically honest place to express "this item is
 * real evidence, but weaker evidence".
 *
 * A generated item passes at less than one because its difficulty is assigned
 * from source data rather than measured against a population of test-takers.
 * Down-weighting both the information and the score contribution is equivalent
 * to observing a fraction of a response — which is exactly the claim being
 * made. At `weight = 1` this is the plain Rasch update, unchanged.
 */
export function updateBelief(
  prior: AbilityBelief,
  difficulty: number,
  correct: boolean,
  weight = 1,
): AbilityBelief {
  const p = probabilityCorrect(prior.theta, difficulty);
  const information = (weight * p * (1 - p)) / SCALE ** 2;
  const priorPrecision = 1 / prior.se ** 2;
  const posteriorPrecision = priorPrecision + information;
  const posteriorSe = Math.sqrt(1 / posteriorPrecision);
  // Score function of the Rasch likelihood, scaled by posterior variance.
  const gradient = (weight * ((correct ? 1 : 0) - p)) / SCALE;
  const theta = prior.theta + gradient / posteriorPrecision;
  return {
    theta: clamp(theta, 3, 12.5),
    se: clamp(posteriorSe, MIN_SE, PRIOR_SE),
  };
}

/**
 * A small decay applied when an estimate has gone unrefreshed. Skills do drift,
 * and an estimate from six weeks ago should not be presented as current.
 */
export function decayBelief(belief: AbilityBelief, daysSinceUpdate: number): AbilityBelief {
  if (daysSinceUpdate <= 14) return belief;
  const extra = Math.min(0.9, (daysSinceUpdate - 14) * 0.012);
  return { theta: belief.theta, se: clamp(belief.se + extra, MIN_SE, PRIOR_SE) };
}

export interface MicroEstimate {
  microSkill: string;
  skill: string;
  theta: number;
  se: number;
  observations: number;
  correct: number;
  timedObservations: number;
  timedCorrect: number;
  avgSecondsRatio: number;
}

export interface SkillEstimate {
  skill: Domain;
  level: number;
  se: number;
  observations: number;
  /** Micro-skills ranked by how much they are dragging the skill down. */
  weakest: { microSkill: string; theta: number; se: number; gapToSkill: number }[];
  strongest: { microSkill: string; theta: number }[];
  /** Difference between untimed and timed accuracy, in levels. Positive = collapse under time. */
  timePressureGap: number | null;
  coverage: number;
}

/**
 * Aggregate micro-skill beliefs into a skill-level estimate.
 *
 * Weighting is inverse-variance (more evidence counts for more) multiplied by
 * the micro-skill's diagnostic weight (some micro-skills predict overall level
 * better than others). Micro-skills with no evidence contribute nothing rather
 * than pulling the estimate toward the prior.
 */
export function aggregateSkill(skill: Domain, estimates: MicroEstimate[]): SkillEstimate {
  const relevant = estimates.filter((e) => e.observations > 0);
  const all = MICRO_SKILLS.filter((m) => m.skill === skill);
  const coverage = all.length ? relevant.length / all.length : 0;

  if (!relevant.length) {
    return {
      skill,
      level: 0,
      se: PRIOR_SE,
      observations: 0,
      weakest: [],
      strongest: [],
      timePressureGap: null,
      coverage: 0,
    };
  }

  let weightedSum = 0;
  let weightTotal = 0;
  let precisionTotal = 0;
  for (const e of relevant) {
    const meta = tryMicroSkill(e.microSkill);
    const diagnostic = meta?.diagnosticWeight ?? 1;
    const precision = 1 / e.se ** 2;
    const w = precision * diagnostic;
    weightedSum += e.theta * w;
    weightTotal += w;
    precisionTotal += precision;
  }
  const level = weightedSum / weightTotal;
  // Aggregate SE cannot be tighter than the evidence supports.
  const se = clamp(Math.sqrt(1 / precisionTotal) * 1.25, 0.3, PRIOR_SE);

  const withGap = relevant
    .map((e) => ({
      microSkill: e.microSkill,
      theta: round(e.theta, 2),
      se: round(e.se, 2),
      gapToSkill: round(level - e.theta, 2),
    }))
    .sort((a, b) => b.gapToSkill - a.gapToSkill);

  const observations = relevant.reduce((a, e) => a + e.observations, 0);
  const timedObs = relevant.reduce((a, e) => a + e.timedObservations, 0);
  const timedCorrect = relevant.reduce((a, e) => a + e.timedCorrect, 0);
  const untimedObs = observations - timedObs;
  const untimedCorrect = relevant.reduce((a, e) => a + e.correct, 0) - timedCorrect;

  let timePressureGap: number | null = null;
  if (timedObs >= 10 && untimedObs >= 10) {
    const timedAcc = timedCorrect / timedObs;
    const untimedAcc = untimedCorrect / untimedObs;
    // Convert an accuracy difference into approximate levels via the logistic slope.
    timePressureGap = round((untimedAcc - timedAcc) * 4 * SCALE, 2);
  }

  return {
    skill,
    level: round(level, 2),
    se: round(se, 2),
    observations,
    weakest: withGap.filter((w) => w.gapToSkill > 0.35).slice(0, 4),
    strongest: withGap.slice(-3).reverse().map((w) => ({ microSkill: w.microSkill, theta: w.theta })),
    timePressureGap,
    coverage: round(coverage, 2),
  };
}

/**
 * Choose the difficulty that yields the most information for this learner.
 * Rasch information peaks where p(correct) = 0.5, but items that hard feel
 * punishing, so Meridian targets ~0.65 — high enough to remain motivating,
 * informative enough to move the estimate. This is a deliberate trade of
 * statistical efficiency for adherence.
 */
export function targetDifficulty(theta: number, desiredSuccess = 0.65): number {
  return theta - SCALE * Math.log(desiredSuccess / (1 - desiredSuccess));
}

/** Expected information gained by asking an item of this difficulty. */
export function expectedInformation(theta: number, difficulty: number): number {
  const p = probabilityCorrect(theta, difficulty);
  return (p * (1 - p)) / SCALE ** 2;
}

/**
 * Response-time signal. A learner who is correct but far slower than the item's
 * target time is not yet fluent — that gap predicts collapse under exam
 * conditions and is surfaced separately from accuracy.
 */
export function pacingVerdict(secondsRatio: number, accuracy: number): {
  key: 'fluent' | 'effortful' | 'rushed' | 'unknown';
  label: string;
} {
  if (!Number.isFinite(secondsRatio) || secondsRatio <= 0) return { key: 'unknown', label: 'Not enough timing data' };
  if (secondsRatio > 1.35 && accuracy >= 0.7) {
    return { key: 'effortful', label: 'Accurate but slow — fluency, not knowledge, is the constraint' };
  }
  if (secondsRatio < 0.6 && accuracy < 0.65) {
    return { key: 'rushed', label: 'Fast and inaccurate — you are answering before the text is resolved' };
  }
  return { key: 'fluent', label: 'Working at exam pace' };
}
