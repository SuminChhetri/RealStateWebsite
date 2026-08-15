import type { LearnerProfile } from '../learner/profile';
import { SKILL_LABELS, tryMicroSkill, type Domain } from '../content/taxonomy';

/**
 * The readiness verdict.
 *
 * This is the most dangerous thing in the product to get wrong, so the
 * constraints are worth stating where the code is.
 *
 * A "ready" verdict attached to an immigration-linked test invites reliance
 * that this product cannot carry: it has no concurrent-validity evidence
 * against official CELPIP outcomes, and none is claimed. So the verdict is
 * expressed strictly in terms of *this product's own practice estimates* and
 * never as a predicted result — and where the evidence is thin, the honest
 * output is "not enough evidence", not a verdict manufactured to look decisive.
 *
 * The decision rule is deliberately conservative and uses the lower bound of
 * the uncertainty interval rather than the point estimate. A learner whose
 * estimate is at target but whose interval reaches well below it has not
 * demonstrated the target; saying otherwise would be reading the number and
 * ignoring what the product knows about how well it knows it.
 */

export type VerdictKey = 'ready' | 'borderline' | 'not-ready' | 'insufficient';

export interface SkillReadiness {
  skill: Domain;
  label: string;
  level: number;
  se: number;
  low: number;
  high: number;
  observations: number;
  /** Below target on the lower bound — the skill that decides the verdict. */
  meetsTarget: boolean;
  holdingBack: string | null;
  nextMove: string | null;
}

export interface ReadinessReport {
  verdict: VerdictKey;
  headline: string;
  reasoning: string;
  target: number;
  daysToExam: number | null;
  skills: SkillReadiness[];
  /** Skills with too little evidence to place at all. */
  unmeasured: Domain[];
  weakest: SkillReadiness | null;
  totalObservations: number;
}

/** Minimum answered items per skill before a verdict is defensible at all. */
const MIN_OBSERVATIONS = 20;

/** Minimum skills placed before an overall verdict is defensible. */
const MIN_SKILLS_PLACED = 3;

export function buildReadinessReport(profile: LearnerProfile): ReadinessReport {
  const target = profile.targetLevel;

  const skills: SkillReadiness[] = profile.skills
    .filter((estimate) => estimate.observations > 0)
    .map((estimate) => {
      const weakest = estimate.weakest[0];
      const meta = weakest ? tryMicroSkill(weakest.microSkill) : null;
      return {
        skill: estimate.skill as Domain,
        label: SKILL_LABELS[estimate.skill as Domain] ?? estimate.skill,
        level: estimate.level,
        se: estimate.se,
        low: Math.max(0, estimate.level - 1.96 * estimate.se),
        high: estimate.level + 1.96 * estimate.se,
        observations: estimate.observations,
        // The lower bound, not the point estimate. See the note above.
        meetsTarget: estimate.level - 1.96 * estimate.se >= target,
        holdingBack: meta?.description ?? null,
        nextMove: meta?.discriminator ?? null,
      };
    });

  const unmeasured = profile.skills
    .filter((estimate) => !estimate.observations)
    .map((estimate) => estimate.skill as Domain);

  const placed = skills.filter((skill) => skill.observations >= MIN_OBSERVATIONS);
  const totalObservations = skills.reduce((sum, skill) => sum + skill.observations, 0);
  const weakest = [...skills].sort((a, b) => a.level - b.level)[0] ?? null;

  if (placed.length < MIN_SKILLS_PLACED) {
    return {
      verdict: 'insufficient',
      headline: 'Not enough evidence for a verdict yet',
      reasoning:
        placed.length === 0
          ? `No skill has the ${MIN_OBSERVATIONS} answered items needed to place it with any confidence. This report will say something useful once there is work behind it — the fastest route there is a full section in each skill.`
          : `Only ${placed.length} of four skills has enough behind it to place (${MIN_OBSERVATIONS}+ items each), and ${unmeasured.length > 0 ? `${unmeasured.map((s) => SKILL_LABELS[s].toLowerCase()).join(' and ')} ${unmeasured.length === 1 ? 'has' : 'have'} not been measured at all` : 'the rest are still thin'}. A verdict drawn from that would be a guess wearing a confident face, so none is given.`,
      target,
      daysToExam: profile.daysToExam,
      skills,
      unmeasured,
      weakest,
      totalObservations,
    };
  }

  const shortfalls = placed.filter((skill) => !skill.meetsTarget);
  const worst = [...shortfalls].sort(
    (a, b) => a.level - 1.96 * a.se - (b.level - 1.96 * b.se),
  )[0];

  if (shortfalls.length === 0) {
    return {
      verdict: 'ready',
      headline: `Every measured skill is at or above CLB ${target} on this platform`,
      reasoning: `Each placed skill has a lower confidence bound at or above the target, which means the estimate is not merely at ${target} but is unlikely to be below it given the evidence so far.${unmeasured.length ? ` ${unmeasured.map((s) => SKILL_LABELS[s]).join(' and ')} ${unmeasured.length === 1 ? 'remains' : 'remain'} unmeasured and ${unmeasured.length === 1 ? 'is' : 'are'} not covered by this statement.` : ''} This describes performance on Meridian practice material only.`,
      target,
      daysToExam: profile.daysToExam,
      skills,
      unmeasured,
      weakest,
      totalObservations,
    };
  }

  // "Borderline" means the point estimate reaches the target but the interval
  // does not — the distinction the whole product exists to make.
  const borderline = shortfalls.every((skill) => skill.level >= target - 0.5);

  if (borderline) {
    return {
      verdict: 'borderline',
      headline: `Close on ${shortfalls.map((s) => s.label.toLowerCase()).join(' and ')}, but not demonstrated`,
      reasoning: `${shortfalls
        .map(
          (s) =>
            `${s.label} sits at ${s.level.toFixed(1)} with the interval reaching down to ${s.low.toFixed(1)}`,
        )
        .join('; ')}. The estimate touches the target; the uncertainty around it does not clear it. That gap closes with more items rather than harder ones — the width of the band is a function of how much evidence there is, not of ability.`,
      target,
      daysToExam: profile.daysToExam,
      skills,
      unmeasured,
      weakest,
      totalObservations,
    };
  }

  return {
    verdict: 'not-ready',
    headline: `${worst.label} is the constraint at CLB ${worst.level.toFixed(1)}`,
    reasoning: `${shortfalls.length === 1 ? 'One skill sits' : `${shortfalls.length} skills sit`} below CLB ${target}: ${shortfalls
      .map((s) => `${s.label.toLowerCase()} at ${s.level.toFixed(1)}`)
      .join(', ')}. An overall result is bounded by its weakest component, so ${worst.label.toLowerCase()} is where time is worth most${
      profile.daysToExam !== null
        ? ` — and with ${profile.daysToExam} day${profile.daysToExam === 1 ? '' : 's'} left, that is where it should nearly all go`
        : ''
    }.`,
    target,
    daysToExam: profile.daysToExam,
    skills,
    unmeasured,
    weakest,
    totalObservations,
  };
}

export const VERDICT_LABELS: Record<VerdictKey, string> = {
  ready: 'At target on measured skills',
  borderline: 'Borderline',
  'not-ready': 'Below target',
  insufficient: 'Insufficient evidence',
};
