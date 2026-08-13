/**
 * The recommendation engine — "what should I do next?".
 *
 * This is the product's core claim: not that it has questions, but that it
 * knows which twenty minutes of practice are worth more than any other twenty
 * minutes for this learner today.
 *
 * Every candidate action is scored as expected level gain per minute, built
 * from four factors that are each individually defensible:
 *
 *   gap        how far the micro-skill sits below the learner's target
 *   leverage   how strongly the micro-skill predicts the overall skill level
 *   evidence   how confident we are the weakness is real, not noise
 *   urgency    review debt, exam proximity, and staleness of the estimate
 *
 * The score is deliberately explainable: `rationale` is generated from the same
 * factors that produced the score, so a learner is never told to do something
 * "because the algorithm said so".
 */
import { tryMicroSkill, SKILL_LABELS, type Domain, type Skill } from '../content/taxonomy';
import { descriptorFor } from '../content/clb';
import { round } from './text';
import type { SkillEstimate } from './ability';

export interface RecommendationInput {
  targetLevel: number;
  examDate: string | null;
  minutesAvailable: number;
  skills: SkillEstimate[];
  /** Micro-skill estimates keyed by slug, for the gap detail. */
  microEstimates: { microSkill: string; skill: string; theta: number; se: number; observations: number }[];
  mistakes: { errorCode: string; microSkill: string; skill: string; summary: string; occurrences: number; lastSeenAt: number; provedStreak: number }[];
  dueReviewCount: number;
  /** Days since the learner last practised each skill. */
  daysSincePractice: Record<string, number>;
  productiveCounts: { writing: number; speaking: number };
  hasDiagnostic: boolean;
  now: number;
}

export interface Recommendation {
  kind: 'drill' | 'lesson' | 'review' | 'writing' | 'speaking' | 'mock' | 'diagnostic';
  skill: string;
  microSkill: string | null;
  title: string;
  rationale: string;
  valueScore: number;
  estimatedMinutes: number;
  href: string;
  payload: Record<string, unknown>;
}

const SKILL_ORDER: Skill[] = ['reading', 'listening', 'writing', 'speaking'];

/** Sentinel for "no completed set of this skill", kept out of learner-facing text. */
const NEVER_PRACTISED = 999;

export function recommend(input: RecommendationInput): Recommendation[] {
  if (!input.hasDiagnostic) {
    return [
      {
        kind: 'diagnostic',
        skill: 'mixed',
        microSkill: null,
        title: 'Take the 25-minute diagnostic',
        rationale:
          'Nothing here is personalised until Meridian has seen you work. The diagnostic samples every micro-skill that separates the bands and returns a profile, not a percentage.',
        valueScore: 100,
        estimatedMinutes: 25,
        href: '/diagnostic',
        payload: {},
      },
    ];
  }

  const daysToExam = daysUntil(input.examDate, input.now);
  const candidates: Recommendation[] = [];

  /* -------- 1. Review debt -------- */
  if (input.dueReviewCount > 0) {
    const minutes = Math.min(20, Math.max(4, Math.round(input.dueReviewCount * 0.5)));
    candidates.push({
      kind: 'review',
      skill: 'mixed',
      microSkill: null,
      title: `Clear ${input.dueReviewCount} scheduled review${input.dueReviewCount === 1 ? '' : 's'}`,
      rationale:
        'These items are scheduled for today because that is when you are most likely to be on the edge of forgetting them. Recalling something at that point is what makes it stick.',
      valueScore: 6.5 + Math.min(3, input.dueReviewCount / 12),
      estimatedMinutes: minutes,
      href: '/review',
      payload: { count: input.dueReviewCount },
    });
  }

  /* -------- 2. Micro-skill gaps -------- */
  for (const skillEstimate of input.skills) {
    if (!skillEstimate.observations) continue;
    const skillGap = input.targetLevel - skillEstimate.level;

    for (const weak of skillEstimate.weakest) {
      const meta = tryMicroSkill(weak.microSkill);
      if (!meta) continue;
      const micro = input.microEstimates.find((m) => m.microSkill === weak.microSkill);
      const observations = micro?.observations ?? 0;

      // A micro-skill that stops discriminating below the learner's level is
      // not worth practising, however weak it looks.
      if (meta.band[1] < input.targetLevel - 2) continue;

      const gap = Math.max(0, input.targetLevel - weak.theta);
      const leverage = meta.diagnosticWeight;
      const evidence = observations >= 8 ? 1 : observations >= 4 ? 0.7 : 0.45;
      const withinSkillDrag = Math.max(0, weak.gapToSkill);

      const value = (gap * 0.9 + withinSkillDrag * 1.4) * leverage * evidence;

      candidates.push({
        kind: 'drill',
        skill: skillEstimate.skill,
        microSkill: weak.microSkill,
        title: `${meta.label} — targeted set`,
        rationale: buildGapRationale({
          meta,
          theta: weak.theta,
          skillLevel: skillEstimate.level,
          skill: skillEstimate.skill,
          observations,
          target: input.targetLevel,
        }),
        valueScore: round(value, 2),
        estimatedMinutes: 12,
        href: `/practice/${skillEstimate.skill}?micro=${encodeURIComponent(weak.microSkill)}`,
        payload: { microSkill: weak.microSkill, targetTheta: weak.theta },
      });

      // Where a weakness is well evidenced, the lesson is worth more than
      // another set of the same questions: repeating a drill you do not
      // understand practises the misunderstanding.
      if (observations >= 6 && weak.theta < input.targetLevel - 1.5) {
        candidates.push({
          kind: 'lesson',
          skill: skillEstimate.skill,
          microSkill: weak.microSkill,
          title: `Learn: ${meta.label.toLowerCase()}`,
          rationale: `You have attempted ${observations} items on ${meta.label.toLowerCase()} and the estimate has settled around CLB ${Math.round(weak.theta)}. That pattern is a method problem, not an exposure problem — the lesson comes before more practice.`,
          valueScore: round(value * 1.15, 2),
          estimatedMinutes: 9,
          href: `/library?micro=${encodeURIComponent(weak.microSkill)}`,
          payload: { microSkill: weak.microSkill },
        });
      }
    }

    /* -------- 3. Time-pressure collapse -------- */
    if (skillEstimate.timePressureGap !== null && skillEstimate.timePressureGap > 0.8) {
      candidates.push({
        kind: 'drill',
        skill: skillEstimate.skill,
        microSkill: null,
        title: `${SKILL_LABELS[skillEstimate.skill as Domain]} under exam pace`,
        rationale: `Your untimed accuracy is about ${skillEstimate.timePressureGap.toFixed(1)} levels above your timed accuracy. You know this material; what you have not yet built is the speed to use it. This set runs at exam pace with no pausing.`,
        valueScore: 5.5 + skillEstimate.timePressureGap,
        estimatedMinutes: 15,
        href: `/practice/${skillEstimate.skill}?pace=exam`,
        payload: { pace: 'exam' },
      });
    }

    /* -------- 4. Staleness -------- */
    const idle = input.daysSincePractice[skillEstimate.skill] ?? NEVER_PRACTISED;
    if (idle >= 10 && skillGap > 0) {
      const label = SKILL_LABELS[skillEstimate.skill as Domain].toLowerCase();
      candidates.push({
        kind: 'drill',
        skill: skillEstimate.skill,
        microSkill: null,
        title: `Return to ${label}`,
        rationale:
          idle >= NEVER_PRACTISED
            ? `You have not practised ${label} as a set yet. What Meridian knows about it comes from the diagnostic alone, which is enough to place you and not enough to be confident.`
            : `It has been ${idle} days since you practised ${label}, so this estimate is going stale. A short mixed set refreshes both the skill and the accuracy of your profile.`,
        valueScore: 4 + Math.min(3, Math.min(idle, 30) / 8),
        estimatedMinutes: 12,
        href: `/practice/${skillEstimate.skill}`,
        payload: { reason: 'stale' },
      });
    }
  }

  /* -------- 5. Recurring mistakes -------- */
  const activeMistakes = input.mistakes
    .filter((m) => m.occurrences >= 2 && m.provedStreak < 2)
    .sort((a, b) => b.occurrences - a.occurrences);
  if (activeMistakes.length) {
    const top = activeMistakes[0];
    candidates.push({
      kind: 'drill',
      skill: top.skill,
      microSkill: top.microSkill,
      title: 'Retest your most repeated mistake',
      rationale: `“${top.summary}” has come up ${top.occurrences} times. Meridian builds a set of items that force exactly that decision — the only way to close a recurring error is to prove it under the same conditions that produced it.`,
      valueScore: 7 + Math.min(3, top.occurrences * 0.6),
      estimatedMinutes: 10,
      href: `/mistakes?focus=${encodeURIComponent(top.errorCode)}`,
      payload: { errorCode: top.errorCode, microSkill: top.microSkill },
    });
  }

  /* -------- 6. Productive skills need volume, not analysis -------- */
  for (const skill of ['writing', 'speaking'] as const) {
    const count = input.productiveCounts[skill];
    const estimate = input.skills.find((s) => s.skill === skill);
    const level = estimate?.level ?? 0;
    if (count < 3 || (estimate && input.targetLevel - level >= 1)) {
      const urgency = count < 3 ? 3 : 0;
      candidates.push({
        kind: skill,
        skill,
        microSkill: null,
        title: skill === 'writing' ? 'Write one full task under time' : 'Record one full speaking task',
        rationale:
          count < 3
            ? `You have completed ${count} ${skill} task${count === 1 ? '' : 's'}. ${SKILL_LABELS[skill]} is scored on what you produce, and there is no substitute for producing it — the estimate stays provisional until you do.`
            : `Your ${skill} estimate is CLB ${level.toFixed(1)} against a target of ${input.targetLevel}. ${descriptorFor(skill, level).lever}`,
        valueScore: 5.5 + urgency + Math.max(0, input.targetLevel - level),
        estimatedMinutes: skill === 'writing' ? 27 : 8,
        href: `/${skill}`,
        payload: {},
      });
    }
  }

  /* -------- 7. Full simulation as the exam approaches -------- */
  if (daysToExam !== null && daysToExam <= 21) {
    candidates.push({
      kind: 'mock',
      skill: 'mixed',
      microSkill: null,
      title: 'Full test simulation',
      rationale: `Your test is ${daysToExam} day${daysToExam === 1 ? '' : 's'} away. At this range the limiting factor is usually stamina and sequencing rather than skill — a full sitting rehearses both.`,
      valueScore: 8 + Math.max(0, (21 - daysToExam) * 0.25),
      estimatedMinutes: 180,
      href: '/mock-tests',
      payload: {},
    });
  }

  /* -------- Rank, diversify, and fit the available time -------- */
  const ranked = candidates
    .map((c) => ({ ...c, valueScore: round(c.valueScore / Math.log2(c.estimatedMinutes + 2), 3) }))
    .sort((a, b) => b.valueScore - a.valueScore);

  const chosen: Recommendation[] = [];
  const usedSkills = new Map<string, number>();
  let minutes = 0;

  for (const candidate of ranked) {
    if (chosen.length >= 5) break;
    const skillCount = usedSkills.get(candidate.skill) ?? 0;
    // A day of practice that is all one skill is worse than a mixed one, even
    // if the single skill scores highest — interleaving is the point.
    if (skillCount >= 2) continue;
    if (candidate.kind === 'mock' && minutes > 0 && input.minutesAvailable < 120) continue;
    if (minutes + candidate.estimatedMinutes > input.minutesAvailable * 1.6 && chosen.length >= 2) continue;

    chosen.push(candidate);
    usedSkills.set(candidate.skill, skillCount + 1);
    minutes += candidate.estimatedMinutes;
  }

  return chosen;
}

function buildGapRationale(args: {
  meta: { label: string; description: string; discriminator: string; band: [number, number] };
  theta: number;
  skillLevel: number;
  skill: string;
  observations: number;
  target: number;
}): string {
  const { meta, theta, skillLevel, skill, observations, target } = args;
  const drag = (skillLevel - theta).toFixed(1);
  const confidence =
    observations >= 8 ? 'across enough items to be confident' : `across ${observations} items so far`;
  return `Your ${SKILL_LABELS[skill as Domain].toLowerCase()} sits around CLB ${skillLevel.toFixed(1)}, but ${meta.label.toLowerCase()} is running ${drag} levels below that ${confidence}. It is one of the micro-skills that keeps discriminating up to CLB ${meta.band[1]}, so closing it moves the whole skill toward ${target}. What to watch for: ${meta.discriminator.toLowerCase()}`;
}

function daysUntil(isoDate: string | null, now: number): number | null {
  if (!isoDate) return null;
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.ceil((target / 1000 - now) / 86400));
}

/** Overall readiness against the target — the headline on the CLB path page. */
export function readiness(skills: SkillEstimate[], targetLevel: number): {
  overall: number;
  weakestSkill: Skill | null;
  gaps: { skill: Skill; level: number; gap: number; se: number; observations: number }[];
  ready: boolean;
} {
  const gaps = SKILL_ORDER.map((skill) => {
    const est = skills.find((s) => s.skill === skill);
    return {
      skill,
      level: est?.level ?? 0,
      gap: round(Math.max(0, targetLevel - (est?.level ?? 0)), 2),
      se: est?.se ?? 2.5,
      observations: est?.observations ?? 0,
    };
  });

  const measured = gaps.filter((g) => g.observations > 0);
  const overall = measured.length ? round(measured.reduce((a, g) => a + g.level, 0) / measured.length, 2) : 0;
  const weakest = measured.length
    ? measured.reduce((a, b) => (b.level < a.level ? b : a)).skill
    : null;

  // "Ready" requires the lower bound of every skill estimate to clear the
  // target — not the point estimate. An estimate that could be a level too low
  // is not readiness.
  const ready =
    measured.length === SKILL_ORDER.length &&
    measured.every((g) => g.level - g.se >= targetLevel);

  return { overall, weakestSkill: weakest, gaps, ready };
}
