/**
 * Spaced retrieval scheduler.
 *
 * A difficulty–stability–retrievability scheduler in the FSRS family: each card
 * carries a stability (days until recall probability falls to the target) and a
 * difficulty (how quickly stability grows). Reviews are scheduled at the point
 * where predicted recall hits the desired retention, which is what makes the
 * review queue shrink as items are genuinely learned instead of growing
 * without bound.
 *
 * The parameters here are the published defaults for this family of schedulers,
 * not values fitted to Meridian's learners — no such data exists yet. The
 * schema records every review so the parameters can be fitted per-learner later
 * without a migration.
 *
 * Meridian schedules three kinds of card through one queue: vocabulary,
 * grammar patterns, and — the part that makes the mistake bank work — the
 * learner's own recorded errors, which come back as retrieval attempts rather
 * than as a list to reread.
 */
import { clamp, round } from './text';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  lastReviewedAt: number | null;
  dueAt: number;
}

export interface SchedulerOptions {
  /** Probability of recall targeted at review time. */
  desiredRetention: number;
  /** Hard cap so nothing disappears before a test date. */
  maximumIntervalDays: number;
}

export const DEFAULT_OPTIONS: SchedulerOptions = {
  desiredRetention: 0.9,
  maximumIntervalDays: 180,
};

const DECAY = -0.5;
const FACTOR = 19 / 81;

/** Predicted probability of recall after `days` at the given stability. */
export function retrievability(days: number, stability: number): number {
  if (stability <= 0) return 0;
  return (1 + FACTOR * (days / stability)) ** DECAY;
}

/** Interval, in days, at which retrievability falls to the desired retention. */
export function intervalForRetention(stability: number, retention: number): number {
  return (stability / FACTOR) * (retention ** (1 / DECAY) - 1);
}

const INITIAL_STABILITY: Record<Grade, number> = {
  again: 0.4,
  hard: 1.2,
  good: 3.2,
  easy: 8.0,
};

const GRADE_INDEX: Record<Grade, number> = { again: 1, hard: 2, good: 3, easy: 4 };

export function newCard(now = nowSeconds()): CardState {
  return {
    stability: 0,
    difficulty: 5,
    reps: 0,
    lapses: 0,
    state: 'new',
    lastReviewedAt: null,
    dueAt: now,
  };
}

export function review(card: CardState, grade: Grade, now = nowSeconds(), options = DEFAULT_OPTIONS): CardState {
  const elapsedDays = card.lastReviewedAt ? (now - card.lastReviewedAt) / 86400 : 0;
  const g = GRADE_INDEX[grade];

  let difficulty: number;
  let stability: number;
  let state: CardState['state'];
  let lapses = card.lapses;

  if (card.state === 'new' || card.stability === 0) {
    difficulty = clamp(5.5 - (g - 3) * 1.15, 1, 10);
    stability = INITIAL_STABILITY[grade];
    state = grade === 'again' ? 'learning' : 'review';
  } else {
    // Difficulty drifts toward the value implied by this grade, with the mean
    // reversion that keeps a single bad day from permanently marking a card.
    const delta = -0.9 * (g - 3);
    const damped = card.difficulty + delta * (10 - card.difficulty) / 9;
    difficulty = clamp(damped * 0.92 + 5 * 0.08, 1, 10);

    const r = retrievability(elapsedDays, card.stability);

    if (grade === 'again') {
      lapses += 1;
      stability = Math.max(
        0.2,
        2.0 * card.stability ** 0.18 * Math.exp(0.6 * (1 - r)) * (11 - difficulty) * 0.06,
      );
      state = 'relearning';
    } else {
      const hardPenalty = grade === 'hard' ? 0.8 : 1;
      const easyBonus = grade === 'easy' ? 1.5 : 1;
      const growth =
        1 +
        Math.exp(1.2) *
          (11 - difficulty) *
          card.stability ** -0.28 *
          (Math.exp(0.9 * (1 - r)) - 1) *
          hardPenalty *
          easyBonus *
          0.08;
      stability = card.stability * clamp(growth, 1.02, 12);
      state = 'review';
    }
  }

  const intervalDays = clamp(
    intervalForRetention(stability, options.desiredRetention),
    state === 'relearning' || state === 'learning' ? 10 / 1440 : 1,
    options.maximumIntervalDays,
  );

  return {
    stability: round(stability, 4),
    difficulty: round(difficulty, 3),
    reps: card.reps + 1,
    lapses,
    state,
    lastReviewedAt: now,
    dueAt: Math.round(now + intervalDays * 86400),
  };
}

/**
 * Interleave a due queue so consecutive cards do not come from the same skill.
 * Interleaving costs a little accuracy during practice and buys retention and
 * discrimination afterwards — the trade Meridian wants for exam preparation.
 */
export function interleave<T extends { kind: string; skill?: string }>(items: T[]): T[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const key = item.skill ?? item.kind;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(item);
  }
  const out: T[] = [];
  let lastKey: string | null = null;
  while (out.length < items.length) {
    const candidates = [...buckets.entries()]
      .filter(([, list]) => list.length > 0)
      .sort((a, b) => b[1].length - a[1].length);
    if (!candidates.length) break;
    const pick = candidates.find(([key]) => key !== lastKey) ?? candidates[0];
    out.push(pick[1].shift()!);
    lastKey = pick[0];
  }
  return out;
}

/**
 * The queue a learner sees today: everything overdue, capped so a returning
 * learner is never met with a 400-card backlog, prioritising the cards closest
 * to being forgotten and the ones tied to recorded mistakes.
 */
export function buildDueQueue<T extends { dueAt: number; stability: number; kind: string; lastReviewedAt: number | null }>(
  cards: T[],
  now: number,
  limit: number,
): T[] {
  const due = cards.filter((c) => c.dueAt <= now);
  const scored = due
    .map((c) => {
      const elapsed = c.lastReviewedAt ? (now - c.lastReviewedAt) / 86400 : 999;
      const r = c.stability > 0 ? retrievability(elapsed, c.stability) : 0;
      // Lowest predicted recall first, with mistakes weighted up: those are the
      // errors the learner has actually made, not generic material.
      const urgency = (1 - r) * (c.kind === 'mistake' ? 1.35 : 1);
      return { card: c, urgency };
    })
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, limit)
    .map((s) => s.card);
  return interleave(scored as (T & { kind: string })[]);
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/** Convert an objective-item outcome into a review grade. */
export function gradeFromOutcome(correct: boolean, secondsRatio: number): Grade {
  if (!correct) return 'again';
  if (secondsRatio > 1.4) return 'hard';
  if (secondsRatio < 0.55) return 'easy';
  return 'good';
}
