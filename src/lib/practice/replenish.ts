import { and, eq, notInArray, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { attemptItems, attempts, questions, stimuli } from '../db/schema';
import { contentId } from '../ids';
import { fleschKincaid, wordCount } from '../engines/text';
import { generateBatch } from '../content/generate';
import { validateQuestion, validateStimulus } from '../content/validate';
import type { SeedQuestion, SeedStimulus } from '../content/seed/types';

/**
 * Keeping the bank ahead of the learner.
 *
 * "Unlimited practice" is a claim about what happens on the learner's fortieth
 * session, not their first. The honest way to keep it is to notice when someone
 * is running out of material they have not already seen, and to make more
 * before they hit the wall — rather than silently recycling items and letting
 * them mistake recall for reading.
 *
 * Generated material goes through exactly the same review pipeline as authored
 * material: validate, then publish only what passes. An item that fails is
 * stored as `in_review` and never delivered. That path was built for authored
 * content and is reused here unchanged, which is the point — the standard does
 * not drop because the author is a program.
 */

/** Below this many unseen items in a skill, top the bank up. */
const COMFORTABLE_HEADROOM = 60;

/** Never generate more than this in one request; a slow page is a bad trade. */
const MAX_BATCH = 4;

export interface PoolStatus {
  /** Published questions the learner has never been served. */
  unseen: number;
  /** Published questions in total for this skill. */
  total: number;
  authored: number;
  generated: number;
}

export async function poolStatus(
  userId: string,
  orgId: string,
  skill: 'reading' | 'listening',
): Promise<PoolStatus> {
  const seen = db
    .select({ id: attemptItems.questionId })
    .from(attemptItems)
    .innerJoin(attempts, eq(attempts.id, attemptItems.attemptId))
    .where(and(eq(attempts.userId, userId), eq(attempts.orgId, orgId)));

  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      authored: sql<number>`sum(case when ${questions.origin} = 'authored' then 1 else 0 end)::int`,
      generated: sql<number>`sum(case when ${questions.origin} = 'generated' then 1 else 0 end)::int`,
      unseen: sql<number>`sum(case when ${questions.id} not in (${seen}) then 1 else 0 end)::int`,
    })
    .from(questions)
    .where(and(eq(questions.skill, skill), eq(questions.status, 'published')));

  return {
    total: row?.total ?? 0,
    authored: row?.authored ?? 0,
    generated: row?.generated ?? 0,
    unseen: row?.unseen ?? 0,
  };
}

/**
 * Ensure the learner has unseen material to draw on, generating more if not.
 *
 * Returns the number of questions added. Zero is the normal case and is not a
 * failure — it means the bank is already ahead.
 */
export async function replenish(
  userId: string,
  orgId: string,
  skill: 'reading' | 'listening',
  headroom = COMFORTABLE_HEADROOM,
): Promise<number> {
  const status = await poolStatus(userId, orgId, skill);
  if (status.unseen >= headroom) return 0;

  const seed = `${orgId}-${skill}-${Date.now().toString(36)}-${status.total}`;
  const batch = generateBatch(seed, MAX_BATCH, skill);
  return persistBatch(batch, seed);
}

/** Insert a generated batch through the review pipeline. Returns items added. */
export async function persistBatch(
  batch: ReturnType<typeof generateBatch>,
  seed: string,
): Promise<number> {
  let added = 0;

  for (const stimulus of batch.stimuli) {
    const result = validateStimulus(stimulus);
    const status = result.passed ? 'published' : 'in_review';
    const id = contentId('stm', stimulus.slug);
    // Readability and word count are computed from whatever carries the words:
    // the body for a passage, the spoken turns for an encounter.
    const text = stimulus.body ?? (stimulus.script ?? []).map((turn) => turn.text).join(' ');

    await db
      .insert(stimuli)
      .values({
        id,
        slug: stimulus.slug,
        skill: stimulus.skill,
        partType: stimulus.partType,
        title: stimulus.title,
        body: stimulus.body ?? null,
        script: stimulus.script ? JSON.stringify(stimulus.script) : null,
        figure: stimulus.figure ? JSON.stringify(stimulus.figure) : null,
        level: stimulus.level,
        wordCount: wordCount(text),
        readability: fleschKincaid(text),
        topic: stimulus.topic,
        origin: 'generated',
        generatorSeed: seed,
        status,
      })
      .onConflictDoNothing({ target: stimuli.slug });

    for (const [index, question] of stimulus.questions.entries()) {
      added += await insertQuestion(question, {
        stimulusId: id,
        skill: stimulus.skill,
        partType: stimulus.partType,
        orderInSet: index,
        seed,
        stimulusText: text,
        // Listening items are heard once and answered under the clock; the
        // authored corpus uses 30 seconds and generated ones must match, or a
        // section built from both would run to two different lengths.
        defaultSeconds: stimulus.skill === 'listening' ? 30 : 50,
      });
    }
  }

  for (const [index, question] of batch.standalone.entries()) {
    added += await insertQuestion(question, {
      stimulusId: null,
      skill: 'reading',
      // Standalone generated items are drill material, not section material:
      // a real section follows the published blueprint, and these do not belong
      // to any of its parts. `partsFor` never returns this, so the mock test
      // cannot pick them up by accident.
      partType: 'reading.drill',
      orderInSet: index,
      seed,
      stimulusText: '',
    });
  }

  return added;
}

async function insertQuestion(
  question: SeedQuestion,
  context: {
    stimulusId: string | null;
    skill: 'reading' | 'listening';
    partType: string;
    orderInSet: number;
    seed: string;
    stimulusText: string;
    defaultSeconds?: number;
  },
): Promise<number> {
  const result = validateQuestion(question, context.stimulusText);
  const status = result.passed ? 'published' : 'in_review';

  await db
    .insert(questions)
    .values({
      id: contentId('qst', question.slug),
      slug: question.slug,
      stimulusId: context.stimulusId,
      skill: context.skill,
      partType: context.partType,
      microSkill: question.microSkill,
      format: question.format ?? 'mcq',
      prompt: question.prompt,
      options: JSON.stringify(question.options),
      answerKey: question.answerKey,
      explanation: question.explanation,
      takeaway: question.takeaway ?? null,
      level: question.level,
      difficulty: question.difficulty,
      targetSeconds: question.targetSeconds ?? context.defaultSeconds ?? 50,
      orderInSet: context.orderInSet,
      origin: 'generated',
      generatorSeed: context.seed,
      status,
    })
    .onConflictDoNothing({ target: questions.slug });

  return status === 'published' ? 1 : 0;
}

export { notInArray };
