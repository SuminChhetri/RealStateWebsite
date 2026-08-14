/**
 * Adaptive study-plan generation.
 *
 * A plan here is a *schedule of intentions*, not a fixed syllabus. It is
 * regenerated whenever the learner's profile moves materially, and each day is
 * built from three principles:
 *
 *  - Distributed practice beats blocking: a skill appears on several separated
 *    days rather than in one long session.
 *  - Interleaving: within a day, blocks alternate between skills, because
 *    practising discrimination between problem types is part of the skill.
 *  - Cumulative review: retrieval of older material is scheduled every day the
 *    learner studies, not saved for the end.
 *
 * Time is allocated by gap-to-target weighted by how much practice each skill
 * needs per level — productive skills (writing, speaking) need fewer, longer
 * sessions; receptive skills tolerate shorter, more frequent ones.
 */
import { SKILL_LABELS, type Skill } from '../content/taxonomy';
import { projectedHours } from '../content/clb';
import { round } from './text';
import type { SkillEstimate } from './ability';

export interface PlanBlock {
  id: string;
  kind: 'drill' | 'lesson' | 'review' | 'writing' | 'speaking' | 'mock' | 'section';
  skill: Skill | 'mixed';
  microSkill?: string;
  title: string;
  minutes: number;
  href: string;
  /** Why this block is on this day. */
  note: string;
}

export interface PlanDay {
  dayIndex: number;
  date: string;
  /** Rest days are deliberate: consolidation is part of the schedule. */
  rest: boolean;
  focus: string;
  blocks: PlanBlock[];
  totalMinutes: number;
}

export interface StudyPlan {
  horizonDays: number;
  startDate: string;
  targetLevel: number;
  days: PlanDay[];
  rationale: string;
  projection: {
    hoursNeeded: number;
    hoursScheduled: number;
    /** Honest verdict on whether the target is reachable in the horizon. */
    verdict: 'comfortable' | 'tight' | 'unrealistic' | 'unknown';
    message: string;
  };
}

export interface PlanInput {
  horizonDays: number;
  startDate: Date;
  targetLevel: number;
  minutesPerDay: number;
  daysPerWeek: number;
  skills: SkillEstimate[];
  weakMicroSkills: { microSkill: string; skill: string; theta: number; label: string }[];
  examDate: string | null;
}

const RECEPTIVE: Skill[] = ['reading', 'listening'];
const PRODUCTIVE: Skill[] = ['writing', 'speaking'];

export function generatePlan(input: PlanInput): StudyPlan {
  const { horizonDays, targetLevel, minutesPerDay, daysPerWeek } = input;

  /* -------- Allocate share of time per skill by gap -------- */
  const gaps = new Map<Skill, number>();
  for (const skill of [...RECEPTIVE, ...PRODUCTIVE]) {
    const est = input.skills.find((s) => s.skill === skill);
    // An unmeasured skill is treated as a full-size gap: it needs evidence.
    const level = est && est.observations > 0 ? est.level : targetLevel - 2.5;
    gaps.set(skill, Math.max(0.3, targetLevel - level));
  }
  const gapTotal = [...gaps.values()].reduce((a, b) => a + b, 0);
  const share = new Map<Skill, number>();
  for (const [skill, gap] of gaps) share.set(skill, gap / gapTotal);

  /* -------- Which days are study days -------- */
  const studyDayPattern = studyPattern(daysPerWeek);

  const days: PlanDay[] = [];
  let scheduledMinutes = 0;
  // Running debt per skill so time allocation converges on the target share.
  const debt = new Map<Skill, number>([...share.entries()].map(([s, v]) => [s, v * minutesPerDay]));

  for (let i = 0; i < horizonDays; i++) {
    const date = addDays(input.startDate, i);
    const dow = date.getUTCDay();
    const isStudyDay = studyDayPattern[dow];
    const isoDate = date.toISOString().slice(0, 10);

    if (!isStudyDay) {
      days.push({
        dayIndex: i,
        date: isoDate,
        rest: true,
        focus: 'Consolidation day',
        blocks: [],
        totalMinutes: 0,
      });
      continue;
    }

    const blocks: PlanBlock[] = [];
    let remaining = minutesPerDay;

    // Every study day opens with retrieval of older material.
    const reviewMinutes = Math.min(12, Math.max(6, Math.round(minutesPerDay * 0.2)));
    blocks.push({
      id: `d${i}-review`,
      kind: 'review',
      skill: 'mixed',
      title: 'Scheduled review',
      minutes: reviewMinutes,
      href: '/review',
      note: 'Retrieval of items you are close to forgetting. Ten minutes here protects everything you have already learned.',
    });
    remaining -= reviewMinutes;

    // Pick the two skills with the largest outstanding debt, alternating so
    // consecutive days do not repeat the same pairing.
    const ordered = [...debt.entries()].sort((a, b) => b[1] - a[1]);
    const primary = ordered[0][0];
    const secondary = ordered.find(([s]) => s !== primary)?.[0] ?? ordered[0][0];

    const primaryMinutes = Math.round(remaining * 0.6);
    const secondaryMinutes = remaining - primaryMinutes;

    // `rotation` counts how many times this skill has already appeared, so
    // successive sessions on the same skill target different micro-skills and
    // different productive tasks instead of repeating one instruction for
    // sixty days.
    const rotation = new Map<Skill, number>();
    for (const day of days) {
      for (const block of day.blocks) {
        if (block.skill !== 'mixed') {
          rotation.set(block.skill as Skill, (rotation.get(block.skill as Skill) ?? 0) + 1);
        }
      }
    }

    blocks.push(buildBlock(i, 'a', primary, primaryMinutes, input, rotation.get(primary) ?? 0));
    if (secondaryMinutes >= 8) {
      blocks.push(
        buildBlock(i, 'b', secondary, secondaryMinutes, input, rotation.get(secondary) ?? 0),
      );
    }

    for (const [skill, value] of debt) {
      const spent =
        (skill === primary ? primaryMinutes : 0) + (skill === secondary ? secondaryMinutes : 0);
      debt.set(skill, value - spent + (share.get(skill) ?? 0) * minutesPerDay);
    }

    // A full section rehearsal every second week, and a full simulation when a
    // test date is close enough for stamina to matter.
    const weekIndex = Math.floor(i / 7);
    if (i % 14 === 13) {
      blocks.push({
        id: `d${i}-section`,
        kind: 'section',
        skill: weekIndex % 2 === 0 ? 'reading' : 'listening',
        title: `Full ${weekIndex % 2 === 0 ? 'Reading' : 'Listening'} section under time`,
        minutes: 55,
        href: `/practice/${weekIndex % 2 === 0 ? 'reading' : 'listening'}?mode=section`,
        note: 'Section-length practice tests pacing and stamina, which drills cannot.',
      });
    }

    const total = blocks.reduce((a, b) => a + b.minutes, 0);
    scheduledMinutes += total;

    days.push({
      dayIndex: i,
      date: isoDate,
      rest: false,
      focus: `${SKILL_LABELS[primary]}${secondaryMinutes >= 8 ? ` · ${SKILL_LABELS[secondary]}` : ''}`,
      blocks,
      totalMinutes: total,
    });
  }

  /* -------- Insert a simulation before the exam -------- */
  if (input.examDate) {
    const examIndex = days.findIndex((d) => d.date >= input.examDate!);
    const target = examIndex > 3 ? examIndex - 3 : -1;
    if (target >= 0) {
      days[target].rest = false;
      days[target].focus = 'Full test simulation';
      days[target].blocks = [
        {
          id: `d${target}-mock`,
          kind: 'mock',
          skill: 'mixed',
          title: 'Full test simulation',
          minutes: 180,
          href: '/mock-tests',
          note: 'Three days before your test: rehearse the full sequence once, then taper.',
        },
      ];
      days[target].totalMinutes = 180;
      // Taper: the two days after the simulation are review only.
      for (let k = target + 1; k < Math.min(days.length, target + 3); k++) {
        days[k].rest = false;
        days[k].focus = 'Taper — review only';
        days[k].blocks = [
          {
            id: `d${k}-taper`,
            kind: 'review',
            skill: 'mixed',
            title: 'Light review',
            minutes: 20,
            href: '/review',
            note: 'Cramming new material now displaces sleep, which is what consolidates everything you already know.',
          },
        ];
        days[k].totalMinutes = 20;
      }
    }
  }

  /* -------- Honest projection -------- */
  const measured = input.skills.filter((s) => s.observations > 0);
  const currentAverage = measured.length
    ? measured.reduce((a, s) => a + s.level, 0) / measured.length
    : 0;
  const hoursNeeded = currentAverage ? projectedHours(currentAverage, targetLevel) : 0;
  const hoursScheduled = round(scheduledMinutes / 60, 1);

  let verdict: StudyPlan['projection']['verdict'] = 'unknown';
  let message =
    'Complete the diagnostic so this projection is based on your performance rather than an assumption.';
  if (currentAverage > 0) {
    const ratio = hoursScheduled / Math.max(1, hoursNeeded);
    if (currentAverage >= targetLevel) {
      verdict = 'comfortable';
      message = `Your current estimates already sit at or above CLB ${targetLevel}. This plan is built to hold that level and remove the remaining inconsistency.`;
    } else if (ratio >= 1.1) {
      verdict = 'comfortable';
      message = `Reaching CLB ${targetLevel} from CLB ${currentAverage.toFixed(1)} typically takes around ${hoursNeeded} hours of focused practice. This plan schedules ${hoursScheduled}, which leaves room for the days you miss.`;
    } else if (ratio >= 0.7) {
      verdict = 'tight';
      message = `This plan schedules ${hoursScheduled} hours against roughly ${hoursNeeded} typically needed to move from CLB ${currentAverage.toFixed(1)} to ${targetLevel}. It is achievable, but only if you keep the schedule. Adding fifteen minutes a day would close the difference.`;
    } else {
      verdict = 'unrealistic';
      message = `Moving from CLB ${currentAverage.toFixed(1)} to ${targetLevel} usually takes around ${hoursNeeded} hours; this horizon allows ${hoursScheduled}. Meridian will not pretend otherwise. Either extend the timeline, raise your daily minutes, or aim at an intermediate target first — the plan below is built to maximise what is reachable.`;
    }
  }

  const rationale = buildRationale(share, input, verdict);

  return {
    horizonDays,
    startDate: input.startDate.toISOString().slice(0, 10),
    targetLevel,
    days,
    rationale,
    projection: { hoursNeeded, hoursScheduled, verdict, message },
  };
}

/** Rotating writing sessions: produce, then revise, then produce again. */
const WRITING_SESSIONS = [
  {
    title: 'Full writing task under time',
    note: 'One complete task under the clock is worth more than three untimed drafts.',
    long: true,
  },
  {
    title: 'Rewrite yesterday’s weakest paragraph',
    note: 'Take the dimension your last feedback ranked lowest and rewrite one paragraph against it. Compare the two versions.',
    long: false,
  },
  {
    title: 'Plan three prompts, write one',
    note: 'Three minutes of planning each on three prompts, then write only the third. Planning is the part that transfers.',
    long: false,
  },
  {
    title: 'Full writing task, different task type',
    note: 'Alternate between the message and the survey response — they reward different moves.',
    long: true,
  },
];

/** Rotating speaking sessions: the same task twice beats two tasks once. */
const SPEAKING_SESSIONS = [
  {
    title: 'One task, recorded twice',
    note: 'Record, listen back once, then re-record the same task applying exactly one change.',
  },
  {
    title: 'Three tasks, one sitting',
    note: 'Back-to-back with no pause between them, as in the test. Review all three afterwards.',
  },
  {
    title: 'Fill the whole window',
    note: 'One rule: keep speaking until the timer ends, even if you repeat a point in different words.',
  },
  {
    title: 'A task type you avoid',
    note: 'Pick the task number you have recorded least. Avoidance is where the estimate is weakest.',
  },
];

function buildBlock(
  dayIndex: number,
  suffix: string,
  skill: Skill,
  minutes: number,
  input: PlanInput,
  rotation: number,
): PlanBlock {
  const id = `d${dayIndex}-${suffix}`;

  if (skill === 'writing') {
    const candidates = minutes >= 25 ? WRITING_SESSIONS : WRITING_SESSIONS.filter((s) => !s.long);
    const session = candidates[rotation % candidates.length];
    return { id, kind: 'writing', skill, title: session.title, minutes, href: '/writing', note: session.note };
  }

  if (skill === 'speaking') {
    const session = SPEAKING_SESSIONS[rotation % SPEAKING_SESSIONS.length];
    return { id, kind: 'speaking', skill, title: session.title, minutes, href: '/speaking', note: session.note };
  }

  // Receptive skills rotate through the weak micro-skills rather than drilling
  // the single weakest one every time: repeating one micro-skill for a fortnight
  // stops producing information long before it stops producing effort.
  const weakForSkill = input.weakMicroSkills.filter((w) => w.skill === skill);
  const weak = weakForSkill.length ? weakForSkill[rotation % weakForSkill.length] : undefined;

  if (weak) {
    return {
      id,
      kind: 'drill',
      skill,
      microSkill: weak.microSkill,
      title: `${SKILL_LABELS[skill]}: ${weak.label.toLowerCase()}`,
      minutes,
      href: `/practice/${skill}?micro=${encodeURIComponent(weak.microSkill)}`,
      note: `Currently around CLB ${weak.theta.toFixed(1)} — below your ${SKILL_LABELS[skill].toLowerCase()} average, and one of the micro-skills that keeps separating levels near your target.`,
    };
  }

  // No identified weakness: alternate between mixed practice and exam pace, so
  // both accuracy and speed keep getting evidence.
  const examPace = rotation % 2 === 1;
  return {
    id,
    kind: 'drill',
    skill,
    title: examPace ? `${SKILL_LABELS[skill]} at exam pace` : `${SKILL_LABELS[skill]} practice`,
    minutes,
    href: examPace ? `/practice/${skill}?pace=exam` : `/practice/${skill}`,
    note: examPace
      ? 'Same material, strict clock. The gap between your timed and untimed accuracy is tracked separately.'
      : 'Mixed set at the difficulty where you are getting about two-thirds right — the range that moves the estimate fastest.',
  };
}

function studyPattern(daysPerWeek: number): boolean[] {
  // Index by getUTCDay(): 0 = Sunday. Rest days are spaced, not clustered.
  const patterns: Record<number, number[]> = {
    1: [2],
    2: [2, 5],
    3: [1, 3, 5],
    4: [1, 2, 4, 6],
    5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  const chosen = patterns[Math.min(7, Math.max(1, daysPerWeek))] ?? patterns[5];
  return Array.from({ length: 7 }, (_, i) => chosen.includes(i));
}

function buildRationale(
  share: Map<Skill, number>,
  input: PlanInput,
  verdict: StudyPlan['projection']['verdict'],
): string {
  const ordered = [...share.entries()].sort((a, b) => b[1] - a[1]);
  const split = ordered
    .map(([skill, value]) => `${SKILL_LABELS[skill]} ${Math.round(value * 100)}%`)
    .join(' · ');
  const lead = ordered[0][0];
  return [
    `Time is split ${split}, weighted by how far each skill sits below CLB ${input.targetLevel}. ${SKILL_LABELS[lead]} carries the largest gap, so it leads most days.`,
    `Each study day opens with scheduled retrieval, then two skills rather than one — alternating between problem types is part of what the test measures.`,
    verdict === 'unrealistic'
      ? 'The projection below is deliberately blunt about what this horizon can deliver.'
      : 'Rest days are scheduled, not accidental: the consolidation that happens between sessions is what makes practice stick.',
  ].join(' ');
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
