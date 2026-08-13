import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  attemptItems,
  attempts,
  itemStats,
  mistakes,
  progressSnapshots,
  questions,
  reviewCards,
  skillEstimates,
  stimuli,
} from '../db/schema';
import { newId } from '../ids';
import { aggregateSkill, updateBelief, type MicroEstimate } from '../engines/ability';
import { gradeFromOutcome, newCard, nowSeconds, review } from '../engines/srs';
import { tryMicroSkill, type Domain } from '../content/taxonomy';

/**
 * Closing the loop.
 *
 * Submitting a set does six things, all inside one transaction so a learner's
 * profile can never be left half-updated:
 *
 *  1. grades the responses;
 *  2. updates the ability belief for every micro-skill touched;
 *  3. records or resolves mistakes — a repeated error increments, a corrected
 *     one advances a "proved" streak and eventually clears;
 *  4. schedules spaced retrieval for anything answered wrongly or slowly;
 *  5. writes a progress snapshot so the trend line is real history, not a
 *     recomputation;
 *  6. updates item-level psychometrics, which is what lets the content system
 *     improve as more learners use it.
 */

export interface SubmittedResponse {
  questionId: string;
  response: string | null;
  elapsedMs: number;
  changedAnswer?: boolean;
  flagged?: boolean;
}

export interface ItemResult {
  questionId: string;
  slug: string;
  microSkill: string;
  skill: string;
  prompt: string;
  correct: boolean;
  response: string | null;
  answerKey: string;
  options: { key: string; text: string; rationale: string }[];
  explanation: string;
  takeaway: string | null;
  elapsedMs: number;
  targetSeconds: number;
  level: number;
  stimulusTitle: string | null;
}

export interface AttemptResult {
  attemptId: string;
  mode: string;
  skill: string;
  rawScore: number;
  maxScore: number;
  estimatedLevel: number | null;
  levelSe: number | null;
  items: ItemResult[];
  microBreakdown: {
    microSkill: string;
    label: string;
    correct: number;
    total: number;
    theta: number;
    se: number;
    delta: number;
  }[];
  pacing: { medianRatio: number; slowItems: number; rushedItems: number };
  newMistakes: number;
  provedMistakes: number;
  reviewsScheduled: number;
}

export function submitAttempt(input: {
  attemptId: string;
  userId: string;
  orgId: string;
  responses: SubmittedResponse[];
}): AttemptResult | null {
  const attempt = db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, input.attemptId), eq(attempts.userId, input.userId), eq(attempts.orgId, input.orgId)))
    .get();
  if (!attempt) return null;
  if (attempt.completedAt) return buildResultFromStored(attempt.id, input.userId, input.orgId);

  const rows = db
    .select({
      itemId: attemptItems.id,
      orderIndex: attemptItems.orderIndex,
      questionId: questions.id,
      slug: questions.slug,
      skill: questions.skill,
      microSkill: questions.microSkill,
      prompt: questions.prompt,
      options: questions.options,
      answerKey: questions.answerKey,
      explanation: questions.explanation,
      takeaway: questions.takeaway,
      difficulty: questions.difficulty,
      level: questions.level,
      targetSeconds: questions.targetSeconds,
      stimulusTitle: stimuli.title,
    })
    .from(attemptItems)
    .innerJoin(questions, eq(questions.id, attemptItems.questionId))
    .leftJoin(stimuli, eq(stimuli.id, questions.stimulusId))
    .where(eq(attemptItems.attemptId, input.attemptId))
    .orderBy(attemptItems.orderIndex)
    .all();

  const responseMap = new Map(input.responses.map((r) => [r.questionId, r]));
  const now = nowSeconds();

  const items: ItemResult[] = [];
  const touchedMicro = new Map<string, { skill: string; correct: number; total: number; before: number }>();
  let rawScore = 0;
  let newMistakes = 0;
  let provedMistakes = 0;
  let reviewsScheduled = 0;
  const ratios: number[] = [];

  db.transaction((tx) => {
    for (const row of rows) {
      const submitted = responseMap.get(row.questionId);
      const response = submitted?.response ?? null;
      const correct = response !== null && response === row.answerKey;
      const elapsedMs = submitted?.elapsedMs ?? 0;
      const ratio = row.targetSeconds > 0 ? elapsedMs / 1000 / row.targetSeconds : 1;
      if (elapsedMs > 0) ratios.push(ratio);
      if (correct) rawScore++;

      tx.update(attemptItems)
        .set({
          response,
          correct,
          elapsedMs,
          changedAnswer: submitted?.changedAnswer ?? false,
          flaggedForReview: submitted?.flagged ?? false,
          answeredAt: now,
        })
        .where(eq(attemptItems.id, row.itemId))
        .run();

      /* ---- 2. ability belief ---- */
      const existing = tx
        .select()
        .from(skillEstimates)
        .where(
          and(
            eq(skillEstimates.userId, input.userId),
            eq(skillEstimates.orgId, input.orgId),
            eq(skillEstimates.microSkill, row.microSkill),
          ),
        )
        .get();

      const prior = existing
        ? { theta: existing.theta, se: existing.se }
        : { theta: 7, se: 2.5 };
      const posterior = updateBelief(prior, row.difficulty, correct);

      const observations = (existing?.observations ?? 0) + 1;
      const correctCount = (existing?.correct ?? 0) + (correct ? 1 : 0);
      const timedObservations = (existing?.timedObservations ?? 0) + (attempt.timed ? 1 : 0);
      const timedCorrect = (existing?.timedCorrect ?? 0) + (attempt.timed && correct ? 1 : 0);
      const previousRatio = existing?.avgSecondsRatio ?? 1;
      const avgRatio =
        elapsedMs > 0
          ? (previousRatio * (observations - 1) + ratio) / observations
          : previousRatio;

      if (existing) {
        tx.update(skillEstimates)
          .set({
            theta: posterior.theta,
            se: posterior.se,
            observations,
            correct: correctCount,
            timedObservations,
            timedCorrect,
            avgSecondsRatio: avgRatio,
            updatedAt: now,
          })
          .where(eq(skillEstimates.id, existing.id))
          .run();
      } else {
        tx.insert(skillEstimates)
          .values({
            id: newId('ske'),
            userId: input.userId,
            orgId: input.orgId,
            skill: row.skill,
            microSkill: row.microSkill,
            theta: posterior.theta,
            se: posterior.se,
            observations,
            correct: correctCount,
            timedObservations,
            timedCorrect,
            avgSecondsRatio: avgRatio,
            updatedAt: now,
          })
          .run();
      }

      const bucket = touchedMicro.get(row.microSkill) ?? {
        skill: row.skill,
        correct: 0,
        total: 0,
        before: prior.theta,
      };
      bucket.correct += correct ? 1 : 0;
      bucket.total += 1;
      touchedMicro.set(row.microSkill, bucket);

      /* ---- 3. mistakes ---- */
      const errorCode = `${row.microSkill}.item`;
      const existingMistake = tx
        .select()
        .from(mistakes)
        .where(
          and(
            eq(mistakes.userId, input.userId),
            eq(mistakes.orgId, input.orgId),
            eq(mistakes.errorCode, errorCode),
            eq(mistakes.microSkill, row.microSkill),
          ),
        )
        .get();

      const meta = tryMicroSkill(row.microSkill);
      if (!correct) {
        if (existingMistake) {
          tx.update(mistakes)
            .set({
              occurrences: existingMistake.occurrences + 1,
              lastSeenAt: now,
              provedStreak: 0,
              resolvedAt: null,
              detail: buildMistakeDetail(row, response),
            })
            .where(eq(mistakes.id, existingMistake.id))
            .run();
        } else {
          newMistakes++;
          tx.insert(mistakes)
            .values({
              id: newId('mis'),
              userId: input.userId,
              orgId: input.orgId,
              source: 'question',
              sourceId: row.questionId,
              skill: row.skill,
              microSkill: row.microSkill,
              errorCode,
              summary: meta ? `${meta.label}: ${meta.description}` : row.microSkill,
              detail: buildMistakeDetail(row, response),
            })
            .run();
        }
      } else if (existingMistake && !existingMistake.resolvedAt) {
        const streak = existingMistake.provedStreak + 1;
        // Three clean retests at or above the level where it was missed is the
        // bar for calling an error closed. Anything less is a lucky guess.
        const resolved = streak >= 3;
        if (resolved) provedMistakes++;
        tx.update(mistakes)
          .set({ provedStreak: streak, resolvedAt: resolved ? now : null })
          .where(eq(mistakes.id, existingMistake.id))
          .run();
      }

      /* ---- 4. spaced retrieval ---- */
      if (!correct || ratio > 1.4) {
        const card = tx
          .select()
          .from(reviewCards)
          .where(
            and(
              eq(reviewCards.userId, input.userId),
              eq(reviewCards.orgId, input.orgId),
              eq(reviewCards.kind, 'question'),
              eq(reviewCards.refId, row.questionId),
            ),
          )
          .get();

        const state = card
          ? {
              stability: card.stability,
              difficulty: card.difficulty,
              reps: card.reps,
              lapses: card.lapses,
              state: card.state,
              lastReviewedAt: card.lastReviewedAt,
              dueAt: card.dueAt,
            }
          : newCard(now);

        const next = review(state, gradeFromOutcome(correct, ratio), now);
        reviewsScheduled++;

        if (card) {
          tx.update(reviewCards)
            .set({
              stability: next.stability,
              difficulty: next.difficulty,
              reps: next.reps,
              lapses: next.lapses,
              state: next.state,
              lastReviewedAt: next.lastReviewedAt,
              dueAt: next.dueAt,
            })
            .where(eq(reviewCards.id, card.id))
            .run();
        } else {
          tx.insert(reviewCards)
            .values({
              id: newId('rvc'),
              userId: input.userId,
              orgId: input.orgId,
              kind: 'question',
              refId: row.questionId,
              stability: next.stability,
              difficulty: next.difficulty,
              reps: next.reps,
              lapses: next.lapses,
              state: next.state,
              lastReviewedAt: next.lastReviewedAt,
              dueAt: next.dueAt,
            })
            .run();
        }
      }

      /* ---- 6. item psychometrics ---- */
      const stat = tx.select().from(itemStats).where(eq(itemStats.questionId, row.questionId)).get();
      const optionCounts = stat ? (JSON.parse(stat.optionCounts) as Record<string, number>) : {};
      if (response) optionCounts[response] = (optionCounts[response] ?? 0) + 1;
      const exposures = (stat?.exposures ?? 0) + 1;
      const correctTotal = (stat?.correct ?? 0) + (correct ? 1 : 0);
      const pValue = correctTotal / exposures;
      const medianSeconds =
        elapsedMs > 0
          ? stat?.medianSeconds
            ? (stat.medianSeconds * (exposures - 1) + elapsedMs / 1000) / exposures
            : elapsedMs / 1000
          : stat?.medianSeconds ?? null;

      // An item almost everyone gets right or wrong stops discriminating and is
      // flagged for author review rather than silently wasting learners' time.
      const flagged = exposures >= 25 && (pValue < 0.12 || pValue > 0.96);

      const values = {
        questionId: row.questionId,
        exposures,
        correct: correctTotal,
        pValue,
        medianSeconds,
        optionCounts: JSON.stringify(optionCounts),
        flagged,
        flagReason: flagged
          ? pValue < 0.12
            ? 'Almost no learner answers this correctly — check the key and the distractors.'
            : 'Almost every learner answers this correctly — it no longer discriminates.'
          : null,
        updatedAt: now,
      };
      tx.insert(itemStats)
        .values(values)
        .onConflictDoUpdate({ target: itemStats.questionId, set: values })
        .run();

      items.push({
        questionId: row.questionId,
        slug: row.slug,
        microSkill: row.microSkill,
        skill: row.skill,
        prompt: row.prompt,
        correct,
        response,
        answerKey: row.answerKey,
        options: JSON.parse(row.options),
        explanation: row.explanation,
        takeaway: row.takeaway,
        elapsedMs,
        targetSeconds: row.targetSeconds,
        level: row.level,
        stimulusTitle: row.stimulusTitle ?? null,
      });
    }

    /* ---- 5. attempt-level estimate and snapshot ---- */
    const skill = attempt.skill as Domain | 'mixed';
    const estimatesForSkill = tx
      .select()
      .from(skillEstimates)
      .where(
        and(
          eq(skillEstimates.userId, input.userId),
          eq(skillEstimates.orgId, input.orgId),
          skill === 'mixed' ? sql`1 = 1` : eq(skillEstimates.skill, skill),
        ),
      )
      .all();

    const micro: MicroEstimate[] = estimatesForSkill.map((e) => ({
      microSkill: e.microSkill,
      skill: e.skill,
      theta: e.theta,
      se: e.se,
      observations: e.observations,
      correct: e.correct,
      timedObservations: e.timedObservations,
      timedCorrect: e.timedCorrect,
      avgSecondsRatio: e.avgSecondsRatio,
    }));

    const skillsToSnapshot: Domain[] =
      skill === 'mixed'
        ? ([...new Set(estimatesForSkill.map((e) => e.skill))] as Domain[])
        : [skill];

    let headline: { level: number; se: number } | null = null;
    for (const s of skillsToSnapshot) {
      const aggregate = aggregateSkill(
        s,
        micro.filter((m) => m.skill === s),
      );
      if (!aggregate.observations) continue;
      if (!headline || (s as string) === (skill as string)) headline = { level: aggregate.level, se: aggregate.se };
      tx.insert(progressSnapshots)
        .values({
          id: newId('snp'),
          userId: input.userId,
          orgId: input.orgId,
          skill: s,
          estimatedLevel: aggregate.level,
          se: aggregate.se,
          observations: aggregate.observations,
          source: attempt.mode,
          sourceId: attempt.id,
        })
        .run();
    }

    tx.update(attempts)
      .set({
        completedAt: now,
        rawScore,
        maxScore: rows.length,
        estimatedLevel: headline?.level ?? null,
        levelSe: headline?.se ?? null,
      })
      .where(eq(attempts.id, attempt.id))
      .run();
  });

  const finalEstimates = db
    .select()
    .from(skillEstimates)
    .where(and(eq(skillEstimates.userId, input.userId), eq(skillEstimates.orgId, input.orgId)))
    .all();

  const microBreakdown = [...touchedMicro.entries()].map(([microSkill, bucket]) => {
    const row = finalEstimates.find((e) => e.microSkill === microSkill);
    const meta = tryMicroSkill(microSkill);
    return {
      microSkill,
      label: meta?.label ?? microSkill,
      correct: bucket.correct,
      total: bucket.total,
      theta: row?.theta ?? 7,
      se: row?.se ?? 2.5,
      delta: Math.round(((row?.theta ?? 7) - bucket.before) * 100) / 100,
    };
  });

  const sortedRatios = [...ratios].sort((a, b) => a - b);
  const median = sortedRatios.length ? sortedRatios[Math.floor(sortedRatios.length / 2)] : 1;
  const updated = db.select().from(attempts).where(eq(attempts.id, attempt.id)).get()!;

  return {
    attemptId: attempt.id,
    mode: attempt.mode,
    skill: attempt.skill,
    rawScore,
    maxScore: rows.length,
    estimatedLevel: updated.estimatedLevel,
    levelSe: updated.levelSe,
    items,
    microBreakdown: microBreakdown.sort((a, b) => a.correct / a.total - b.correct / b.total),
    pacing: {
      medianRatio: Math.round(median * 100) / 100,
      slowItems: ratios.filter((r) => r > 1.4).length,
      rushedItems: ratios.filter((r) => r < 0.5).length,
    },
    newMistakes,
    provedMistakes,
    reviewsScheduled,
  };
}

function buildMistakeDetail(
  row: { prompt: string; options: string; answerKey: string },
  response: string | null,
): string {
  const options = JSON.parse(row.options) as { key: string; text: string; rationale: string }[];
  const chosen = options.find((o) => o.key === response);
  const key = options.find((o) => o.key === row.answerKey);
  if (!chosen) return `Left unanswered. The answer was “${key?.text ?? row.answerKey}”.`;
  return `You chose “${chosen.text}” — ${chosen.rationale} The answer was “${key?.text ?? row.answerKey}”.`;
}

/** Re-read a completed attempt without re-grading it. */
export function buildResultFromStored(attemptId: string, userId: string, orgId: string): AttemptResult | null {
  const attempt = db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId), eq(attempts.orgId, orgId)))
    .get();
  if (!attempt) return null;

  const rows = db
    .select({
      response: attemptItems.response,
      correct: attemptItems.correct,
      elapsedMs: attemptItems.elapsedMs,
      questionId: questions.id,
      slug: questions.slug,
      skill: questions.skill,
      microSkill: questions.microSkill,
      prompt: questions.prompt,
      options: questions.options,
      answerKey: questions.answerKey,
      explanation: questions.explanation,
      takeaway: questions.takeaway,
      level: questions.level,
      targetSeconds: questions.targetSeconds,
      stimulusTitle: stimuli.title,
    })
    .from(attemptItems)
    .innerJoin(questions, eq(questions.id, attemptItems.questionId))
    .leftJoin(stimuli, eq(stimuli.id, questions.stimulusId))
    .where(eq(attemptItems.attemptId, attemptId))
    .orderBy(attemptItems.orderIndex)
    .all();

  const estimates = db
    .select()
    .from(skillEstimates)
    .where(and(eq(skillEstimates.userId, userId), eq(skillEstimates.orgId, orgId)))
    .all();

  const grouped = new Map<string, { correct: number; total: number }>();
  for (const r of rows) {
    const bucket = grouped.get(r.microSkill) ?? { correct: 0, total: 0 };
    bucket.correct += r.correct ? 1 : 0;
    bucket.total += 1;
    grouped.set(r.microSkill, bucket);
  }

  const ratios = rows.filter((r) => r.elapsedMs > 0).map((r) => r.elapsedMs / 1000 / r.targetSeconds);
  const sorted = [...ratios].sort((a, b) => a - b);

  return {
    attemptId,
    mode: attempt.mode,
    skill: attempt.skill,
    rawScore: attempt.rawScore ?? rows.filter((r) => r.correct).length,
    maxScore: attempt.maxScore ?? rows.length,
    estimatedLevel: attempt.estimatedLevel,
    levelSe: attempt.levelSe,
    items: rows.map((r) => ({
      questionId: r.questionId,
      slug: r.slug,
      microSkill: r.microSkill,
      skill: r.skill,
      prompt: r.prompt,
      correct: !!r.correct,
      response: r.response,
      answerKey: r.answerKey,
      options: JSON.parse(r.options),
      explanation: r.explanation,
      takeaway: r.takeaway,
      elapsedMs: r.elapsedMs,
      targetSeconds: r.targetSeconds,
      level: r.level,
      stimulusTitle: r.stimulusTitle ?? null,
    })),
    microBreakdown: [...grouped.entries()].map(([microSkill, bucket]) => {
      const row = estimates.find((e) => e.microSkill === microSkill);
      return {
        microSkill,
        label: tryMicroSkill(microSkill)?.label ?? microSkill,
        correct: bucket.correct,
        total: bucket.total,
        theta: row?.theta ?? 7,
        se: row?.se ?? 2.5,
        delta: 0,
      };
    }),
    pacing: {
      medianRatio: sorted.length ? Math.round(sorted[Math.floor(sorted.length / 2)] * 100) / 100 : 1,
      slowItems: ratios.filter((r) => r > 1.4).length,
      rushedItems: ratios.filter((r) => r < 0.5).length,
    },
    newMistakes: 0,
    provedMistakes: 0,
    reviewsScheduled: 0,
  };
}
