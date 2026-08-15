import { probabilityCorrect } from './ability';
import { tryMicroSkill } from '../content/taxonomy';

/**
 * Forensic analysis of a single sitting.
 *
 * The per-item feedback a learner already gets for free answers "why was this
 * one wrong". This answers a different question that per-item feedback cannot:
 * *how did this sitting go as a performance*. Those are not the same thing, and
 * the second one is where the recoverable marks usually are.
 *
 * Everything below is computed from timing and correctness data the runner
 * already records. Nothing is inferred about the learner's state of mind — the
 * report says "accuracy fell in the last third", not "you lost concentration",
 * because the first is measured and the second is a story about it.
 */

export interface SittingItem {
  orderIndex: number;
  correct: boolean | null;
  elapsedMs: number;
  targetSeconds: number;
  difficulty: number;
  microSkill: string;
  partType: string;
  changedAnswer: boolean;
  flagged: boolean;
  answered: boolean;
}

export interface Finding {
  key: string;
  severity: 'critical' | 'caution' | 'positive' | 'neutral';
  title: string;
  detail: string;
  /** What to do about it, or null when the finding is only descriptive. */
  action: string | null;
}

export interface MicroLoss {
  microSkill: string;
  label: string;
  attempted: number;
  wrong: number;
  /** Share of all lost marks in this sitting. */
  share: number;
  medianPace: number;
}

export interface SittingReport {
  items: number;
  answered: number;
  correct: number;
  accuracy: number;
  /** Seconds actually spent on answered items. */
  secondsUsed: number;
  secondsBudget: number;
  /** Median of (time spent ÷ time the item is designed to take). */
  medianPace: number;
  thirds: { label: string; accuracy: number; medianPace: number; items: number }[];
  losses: MicroLoss[];
  /** Accuracy split by whether the item was above or below the learner's level. */
  byDifficulty: { band: string; attempted: number; correct: number }[];
  changed: { count: number; helped: number; hurt: number; neutral: number };
  flagged: { count: number; correct: number };
  unanswered: number;
  findings: Finding[];
}

const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export function buildSittingReport(input: {
  items: SittingItem[];
  timeLimitSeconds: number | null;
  /** The learner's ability at the time, for the difficulty split. */
  ability: number;
}): SittingReport {
  const items = [...input.items].sort((a, b) => a.orderIndex - b.orderIndex);
  const answered = items.filter((item) => item.answered);
  const correct = answered.filter((item) => item.correct === true).length;
  const accuracy = answered.length ? correct / answered.length : 0;

  const paceOf = (item: SittingItem) =>
    item.targetSeconds > 0 ? item.elapsedMs / 1000 / item.targetSeconds : 1;

  const timed = answered.filter((item) => item.elapsedMs > 0);
  const secondsUsed = Math.round(timed.reduce((sum, item) => sum + item.elapsedMs, 0) / 1000);
  const secondsBudget =
    input.timeLimitSeconds ?? items.reduce((sum, item) => sum + item.targetSeconds, 0);

  // Thirds rather than halves: fatigue in a fifty-minute section usually shows
  // in the last third, and halves hide it by averaging it with the middle.
  const size = Math.max(1, Math.ceil(items.length / 3));
  const thirds = ['First third', 'Middle third', 'Last third'].map((label, index) => {
    const slice = items.slice(index * size, (index + 1) * size).filter((item) => item.answered);
    const sliceTimed = slice.filter((item) => item.elapsedMs > 0);
    return {
      label,
      items: slice.length,
      accuracy: slice.length ? slice.filter((i) => i.correct === true).length / slice.length : 0,
      medianPace: median(sliceTimed.map(paceOf)),
    };
  });

  const wrongTotal = answered.filter((item) => item.correct !== true).length;
  const byMicro = new Map<string, SittingItem[]>();
  for (const item of answered) {
    byMicro.set(item.microSkill, [...(byMicro.get(item.microSkill) ?? []), item]);
  }
  const losses: MicroLoss[] = [...byMicro.entries()]
    .map(([microSkill, group]) => {
      const wrong = group.filter((item) => item.correct !== true).length;
      return {
        microSkill,
        label: tryMicroSkill(microSkill)?.label ?? microSkill,
        attempted: group.length,
        wrong,
        share: wrongTotal ? wrong / wrongTotal : 0,
        medianPace: median(group.filter((i) => i.elapsedMs > 0).map(paceOf)),
      };
    })
    .filter((loss) => loss.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong);

  // Below / at / above the learner's own level, rather than absolute
  // difficulty — "hard" only means anything relative to the person answering.
  const bands: { band: string; attempted: number; correct: number }[] = [
    { band: 'Below your level', attempted: 0, correct: 0 },
    { band: 'At your level', attempted: 0, correct: 0 },
    { band: 'Above your level', attempted: 0, correct: 0 },
  ];
  for (const item of answered) {
    const p = probabilityCorrect(input.ability, item.difficulty);
    const index = p > 0.75 ? 0 : p >= 0.45 ? 1 : 2;
    bands[index].attempted++;
    if (item.correct === true) bands[index].correct++;
  }

  const changedItems = answered.filter((item) => item.changedAnswer);
  const changed = {
    count: changedItems.length,
    helped: changedItems.filter((item) => item.correct === true).length,
    hurt: changedItems.filter((item) => item.correct !== true).length,
    neutral: 0,
  };

  const flaggedItems = answered.filter((item) => item.flagged);
  const flagged = { count: flaggedItems.length, correct: flaggedItems.filter((i) => i.correct === true).length };

  const unanswered = items.length - answered.length;
  const medianPace = median(timed.map(paceOf));

  /* ---- Findings: only things the data actually supports. ---- */
  const findings: Finding[] = [];

  if (unanswered > 0) {
    findings.push({
      key: 'unanswered',
      severity: 'critical',
      title: `${unanswered} item${unanswered === 1 ? '' : 's'} left unanswered`,
      detail:
        'Unanswered items are marked wrong. On a four-option question a guess is worth a quarter of a mark on average, and leaving it blank is worth nothing — so the arithmetic never favours a blank.',
      action: 'In the last two minutes, answer everything still empty before reviewing anything.',
    });
  }

  const first = thirds[0];
  const last = thirds[2];
  if (first.items >= 3 && last.items >= 3 && first.accuracy - last.accuracy >= 0.2) {
    findings.push({
      key: 'fade',
      severity: 'caution',
      title: 'Accuracy fell across the sitting',
      detail: `${Math.round(first.accuracy * 100)}% in the first third against ${Math.round(
        last.accuracy * 100,
      )}% in the last. The items were not systematically harder; what changed was where in the sitting they came.`,
      action: 'Practise in full-length sections rather than short sets. Endurance is trained, not rested into.',
    });
  }

  if (medianPace > 1.25) {
    findings.push({
      key: 'slow',
      severity: 'caution',
      title: `Running at ${medianPace.toFixed(2)}× the intended pace`,
      detail:
        'Over the whole section that is the difference between finishing and not. Time spent past the point of decision rarely changes the answer.',
      action: 'Set a hard per-item ceiling and move when you hit it, flagging rather than lingering.',
    });
  } else if (medianPace < 0.6 && accuracy < 0.7) {
    findings.push({
      key: 'rushing',
      severity: 'caution',
      title: `Answering at ${medianPace.toFixed(2)}× the intended pace, with accuracy below 70%`,
      detail:
        'Fast and wrong is a different problem from slow and right, and it is usually the cheaper one to fix: the time is available and is not being used.',
      action: 'Before answering, name the words in the text that force your choice. If you cannot, read again.',
    });
  }

  if (changed.count >= 3) {
    const rate = changed.helped / changed.count;
    findings.push({
      key: 'changed',
      severity: rate >= 0.5 ? 'positive' : 'caution',
      title: `You changed ${changed.count} answer${changed.count === 1 ? '' : 's'}, and ${changed.helped} ended correct`,
      detail:
        rate >= 0.5
          ? 'Your second thoughts are better than your first ones here, which is worth knowing — the common advice to stick with your first instinct is not true for everyone.'
          : 'Your first choice was right more often than your revision. That is a pattern worth trusting under time pressure.',
      action: null,
    });
  }

  const above = bands[2];
  const below = bands[0];
  if (below.attempted >= 4 && below.correct / below.attempted < 0.75) {
    findings.push({
      key: 'easy-losses',
      severity: 'critical',
      title: 'Marks lost on items below your level',
      detail: `${below.attempted - below.correct} of ${below.attempted} items that should have been comfortable were missed. Those are the cheapest marks on the paper.`,
      action: 'Review these first. An error on an easy item is a process problem, not a knowledge problem.',
    });
  } else if (above.attempted >= 4 && above.correct / above.attempted >= 0.6) {
    findings.push({
      key: 'stretch',
      severity: 'positive',
      title: 'Holding up on items above your level',
      detail: `${above.correct} of ${above.attempted} items harder than your current estimate came out correct, which is what moves an estimate upward.`,
      action: null,
    });
  }

  if (losses[0] && losses[0].share >= 0.3) {
    findings.push({
      key: 'concentrated',
      severity: 'caution',
      title: `${Math.round(losses[0].share * 100)}% of the losses were one micro-skill`,
      detail: `${losses[0].label}: ${losses[0].wrong} of ${losses[0].attempted} wrong. Losses this concentrated are the most fixable kind, because one method change reaches all of them.`,
      action: `Drill ${losses[0].label.toLowerCase()} before anything else.`,
    });
  }

  if (findings.length === 0) {
    findings.push({
      key: 'clean',
      severity: 'positive',
      title: 'Nothing stands out as a process problem',
      detail:
        'Pace, endurance and difficulty handling all look ordinary for this sitting. Where marks were lost, they were lost on the content rather than on how the section was taken.',
      action: null,
    });
  }

  return {
    items: items.length,
    answered: answered.length,
    correct,
    accuracy,
    secondsUsed,
    secondsBudget,
    medianPace,
    thirds,
    losses: losses.slice(0, 8),
    byDifficulty: bands,
    changed,
    flagged,
    unanswered,
    findings,
  };
}

/* ------------------------------------------------------------------ */
/* Comparing two sittings                                              */
/* ------------------------------------------------------------------ */

export type MovementKind = 'improved' | 'declined' | 'noise';

export interface Movement {
  label: string;
  before: number;
  after: number;
  delta: number;
  kind: MovementKind;
  explanation: string;
}

/**
 * Whether a change between two sittings is real.
 *
 * This is the question every repeat candidate asks and almost nothing answers
 * honestly, because answering it honestly usually means saying "that is noise"
 * about a number someone was pleased with.
 *
 * The rule: a difference counts as movement only when it exceeds the combined
 * standard error of the two estimates. Anything smaller is inside the range the
 * measurement itself produces, and reporting it as progress would be inventing
 * information.
 */
export function compareEstimates(input: {
  label: string;
  before: { level: number; se: number };
  after: { level: number; se: number };
}): Movement {
  const delta = input.after.level - input.before.level;
  // Standard error of a difference between two independent estimates.
  const combined = Math.sqrt(input.before.se ** 2 + input.after.se ** 2);
  const kind: MovementKind =
    Math.abs(delta) <= combined ? 'noise' : delta > 0 ? 'improved' : 'declined';

  return {
    label: input.label,
    before: input.before.level,
    after: input.after.level,
    delta,
    kind,
    explanation:
      kind === 'noise'
        ? `A change of ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} is inside the ±${combined.toFixed(
            1,
          )} the measurement itself produces. Reporting it as progress would be reading the noise.`
        : `${delta > 0 ? 'Up' : 'Down'} ${Math.abs(delta).toFixed(1)}, which exceeds the ±${combined.toFixed(
            1,
          )} combined uncertainty of the two estimates. This is a real change.`,
  };
}
