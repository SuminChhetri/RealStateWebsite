import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { attemptItems, attempts, questions, stimuli } from '../db/schema';
import { newId } from '../ids';
import { expectedInformation, targetDifficulty } from '../engines/ability';
import { SECTION_BLUEPRINT, partsFor, type Domain, type Skill } from '../content/taxonomy';

/**
 * Item selection.
 *
 * "Unlimited practice" only means something if every set is the *right* set.
 * Selection is adaptive on three axes:
 *
 *  - difficulty, targeted at roughly a two-thirds success rate, which is where
 *    the ability estimate moves fastest without the set becoming punishing;
 *  - micro-skill, weighted toward whatever is currently dragging the learner
 *    down rather than sampled uniformly;
 *  - exposure, so recently-seen items are suppressed until spaced retrieval
 *    schedules them back.
 *
 * Options are shuffled per attempt with a seed derived from the attempt id, so
 * position bias is removed and a learner who repeats a set does not recognise
 * the answer by its position — while the same attempt always renders
 * identically on reload.
 */

export interface DeliveredOption {
  key: string;
  text: string;
}

export interface DeliveredQuestion {
  id: string;
  slug: string;
  skill: string;
  partType: string;
  microSkill: string;
  format: string;
  prompt: string;
  options: DeliveredOption[];
  level: number;
  targetSeconds: number;
  orderIndex: number;
  stimulusId: string | null;
}

export interface DeliveredStimulus {
  id: string;
  slug: string;
  skill: string;
  partType: string;
  title: string;
  body: string | null;
  script: { speaker: string; voice: string; text: string }[] | null;
  figure: { kind: string; caption: string; columns: string[]; rows: string[][]; note?: string } | null;
  level: number;
}

export interface DeliveredSet {
  attemptId: string;
  mode: string;
  skill: string;
  timed: boolean;
  timeLimitSeconds: number | null;
  stimuli: DeliveredStimulus[];
  questions: DeliveredQuestion[];
}

/* ------------------------------------------------------------------ */
/* Deterministic shuffling                                             */
/* ------------------------------------------------------------------ */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const out = [...items];
  let state = hash(seed) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

interface SelectionRequest {
  userId: string;
  orgId: string;
  skill: Skill | 'mixed';
  mode: 'diagnostic' | 'drill' | 'section' | 'mock' | 'review' | 'remediation';
  count: number;
  timed: boolean;
  /** Target ability per micro-skill; falls back to the skill-level estimate. */
  abilityByMicroSkill: Record<string, number>;
  defaultAbility: number;
  /** Micro-skills to concentrate on. Empty means "spread across the skill". */
  focusMicroSkills?: string[];
  /** Question ids seen recently, suppressed unless the pool is exhausted. */
  excludeQuestionIds?: string[];
  partType?: string;
}

interface CandidateRow {
  id: string;
  slug: string;
  skill: string;
  partType: string;
  microSkill: string;
  format: string;
  prompt: string;
  options: string;
  level: number;
  difficulty: number;
  targetSeconds: number;
  stimulusId: string | null;
  orderInSet: number;
}

function candidatePool(skill: Skill | 'mixed', partType?: string): CandidateRow[] {
  const conditions = [eq(questions.status, 'published')];
  if (skill !== 'mixed') conditions.push(eq(questions.skill, skill as 'reading' | 'listening'));
  if (partType) conditions.push(eq(questions.partType, partType));

  return db
    .select({
      id: questions.id,
      slug: questions.slug,
      skill: questions.skill,
      partType: questions.partType,
      microSkill: questions.microSkill,
      format: questions.format,
      prompt: questions.prompt,
      options: questions.options,
      level: questions.level,
      difficulty: questions.difficulty,
      targetSeconds: questions.targetSeconds,
      stimulusId: questions.stimulusId,
      orderInSet: questions.orderInSet,
    })
    .from(questions)
    .where(and(...conditions))
    .all() as CandidateRow[];
}

/**
 * Score each candidate for this learner and take the best `count`, keeping
 * items from the same stimulus together so a passage is never delivered with
 * only one of its questions.
 */
export function selectQuestions(request: SelectionRequest): CandidateRow[] {
  const pool = candidatePool(request.skill, request.partType);
  if (!pool.length) return [];

  const excluded = new Set(request.excludeQuestionIds ?? []);
  const focus = new Set(request.focusMicroSkills ?? []);

  const scored = pool.map((row) => {
    const ability = request.abilityByMicroSkill[row.microSkill] ?? request.defaultAbility;
    const ideal = targetDifficulty(ability);
    // Information is maximised near the ability; the exponential term keeps the
    // set from drifting far above or below where the learner actually is.
    const fit = expectedInformation(ideal, row.difficulty) / expectedInformation(ideal, ideal);
    const focusBoost = focus.size ? (focus.has(row.microSkill) ? 1.9 : 0.35) : 1;
    const freshness = excluded.has(row.id) ? 0.12 : 1;
    return { row, score: fit * focusBoost * freshness };
  });

  scored.sort((a, b) => b.score - a.score);

  const chosen: CandidateRow[] = [];
  const takenStimuli = new Set<string>();

  for (const { row } of scored) {
    if (chosen.length >= request.count) break;
    if (!row.stimulusId) {
      chosen.push(row);
      continue;
    }
    if (takenStimuli.has(row.stimulusId)) continue;
    takenStimuli.add(row.stimulusId);
    // Take the sibling items from the same stimulus, best-scoring first, so the
    // learner reads a passage once and answers a coherent set from it.
    const siblings = scored
      .filter((s) => s.row.stimulusId === row.stimulusId)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.row);
    for (const sibling of siblings) {
      if (chosen.length >= request.count) break;
      chosen.push(sibling);
    }
  }

  // Present each stimulus's items in their authored order.
  chosen.sort((a, b) => {
    if (a.stimulusId === b.stimulusId) return a.orderInSet - b.orderInSet;
    return 0;
  });

  return chosen.slice(0, request.count);
}

/* ------------------------------------------------------------------ */
/* Attempt creation                                                    */
/* ------------------------------------------------------------------ */

export function createAttempt(input: SelectionRequest & { blueprint?: Record<string, unknown> }): DeliveredSet | null {
  const selected = selectQuestions(input);
  if (!selected.length) return null;

  const attemptId = newId('att');
  const timeLimit = input.timed
    ? selected.reduce((a, q) => a + q.targetSeconds, 0)
    : null;

  db.transaction((tx) => {
    tx.insert(attempts)
      .values({
        id: attemptId,
        userId: input.userId,
        orgId: input.orgId,
        mode: input.mode,
        skill: input.skill,
        blueprint: JSON.stringify({
          ...(input.blueprint ?? {}),
          focusMicroSkills: input.focusMicroSkills ?? [],
          targetAbility: input.defaultAbility,
          count: selected.length,
        }),
        timed: input.timed,
        timeLimitSeconds: timeLimit,
        maxScore: selected.length,
      })
      .run();

    selected.forEach((question, index) => {
      tx.insert(attemptItems)
        .values({
          id: newId('ati'),
          attemptId,
          questionId: question.id,
          questionVersion: 1,
          orderIndex: index,
        })
        .run();
    });
  });

  return hydrateAttempt(attemptId, input.userId, input.orgId)!;
}

export function hydrateAttempt(attemptId: string, userId: string, orgId: string): DeliveredSet | null {
  const attempt = db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId), eq(attempts.orgId, orgId)))
    .get();
  if (!attempt) return null;

  const rows = db
    .select({
      orderIndex: attemptItems.orderIndex,
      response: attemptItems.response,
      id: questions.id,
      slug: questions.slug,
      skill: questions.skill,
      partType: questions.partType,
      microSkill: questions.microSkill,
      format: questions.format,
      prompt: questions.prompt,
      options: questions.options,
      level: questions.level,
      targetSeconds: questions.targetSeconds,
      stimulusId: questions.stimulusId,
    })
    .from(attemptItems)
    .innerJoin(questions, eq(questions.id, attemptItems.questionId))
    .where(eq(attemptItems.attemptId, attemptId))
    .orderBy(attemptItems.orderIndex)
    .all();

  const stimulusIds = [...new Set(rows.map((r) => r.stimulusId).filter((x): x is string => !!x))];
  const stimulusRows = stimulusIds.length
    ? db.select().from(stimuli).where(inArray(stimuli.id, stimulusIds)).all()
    : [];

  return {
    attemptId,
    mode: attempt.mode,
    skill: attempt.skill,
    timed: attempt.timed,
    timeLimitSeconds: attempt.timeLimitSeconds,
    stimuli: stimulusRows.map((s) => ({
      id: s.id,
      slug: s.slug,
      skill: s.skill,
      partType: s.partType,
      title: s.title,
      body: s.body,
      script: s.script ? JSON.parse(s.script) : null,
      figure: s.figure ? JSON.parse(s.figure) : null,
      level: s.level,
    })),
    questions: rows.map((r) => {
      const parsed = JSON.parse(r.options) as { key: string; text: string }[];
      const shuffled = seededShuffle(parsed, `${attemptId}:${r.id}`);
      return {
        id: r.id,
        slug: r.slug,
        skill: r.skill,
        partType: r.partType,
        microSkill: r.microSkill,
        format: r.format,
        prompt: r.prompt,
        options: shuffled.map((o) => ({ key: o.key, text: o.text })),
        level: r.level,
        targetSeconds: r.targetSeconds,
        orderIndex: r.orderIndex,
        stimulusId: r.stimulusId,
      };
    }),
  };
}

/** Questions the learner has seen in the last `days` days. */
export function recentlySeen(userId: string, orgId: string, days = 10): string[] {
  const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
  return db
    .select({ questionId: attemptItems.questionId })
    .from(attemptItems)
    .innerJoin(attempts, eq(attempts.id, attemptItems.attemptId))
    .where(and(eq(attempts.userId, userId), eq(attempts.orgId, orgId), sql`${attempts.startedAt} > ${cutoff}`))
    .all()
    .map((r) => r.questionId);
}

/**
 * The diagnostic blueprint: a short set that maximises information about the
 * *profile*, not the overall score. It samples every high-weight micro-skill
 * across both receptive skills at a spread of difficulties, which is why it
 * can say something useful after twenty-five minutes.
 */
export function diagnosticBlueprint(): { skill: Skill; partType: string; count: number }[] {
  const plan: { skill: Skill; partType: string; count: number }[] = [];
  for (const skill of ['reading', 'listening'] as const) {
    for (const part of partsFor(skill as Domain).slice(0, 3)) {
      plan.push({ skill, partType: part.slug, count: 4 });
    }
  }
  return plan;
}

export function sectionBlueprint(skill: Skill) {
  return SECTION_BLUEPRINT[skill];
}

export { notInArray };
