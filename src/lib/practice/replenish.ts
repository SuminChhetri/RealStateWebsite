import { and, eq, notInArray, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  attemptItems,
  attempts,
  questions,
  speakingSubmissions,
  speakingTasks,
  stimuli,
  writingSubmissions,
  writingTasks,
} from '../db/schema';
import { contentId } from '../ids';
import { fleschKincaid, wordCount } from '../engines/text';
import { generateBatch } from '../content/generate';
import { generateWritingTask } from '../content/generate/scenario';
import { SPEAKING_TASK_NUMBERS, generateSpeakingTask } from '../content/generate/speaking-prompt';
import { validateQuestion, validateSpeakingTask, validateStimulus, validateWritingTask } from '../content/validate';
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

/* ------------------------------------------------------------------ */
/* Writing and speaking prompts                                        */
/* ------------------------------------------------------------------ */

/**
 * Prompts are a different economy from items.
 *
 * A learner gets through one writing task in twenty-seven minutes and one
 * speaking task in ninety seconds, so the bank empties far more slowly — but it
 * does empty, and a learner rehearsing daily in the fortnight before a test
 * will see the whole authored set. The threshold is therefore lower and the
 * batches smaller than for items.
 */
const PROMPT_HEADROOM = 6;

export interface PromptPoolStatus {
  unattempted: number;
  total: number;
  authored: number;
  generated: number;
}

export async function writingPoolStatus(userId: string, orgId: string): Promise<PromptPoolStatus> {
  const done = db
    .select({ id: writingSubmissions.taskId })
    .from(writingSubmissions)
    .where(and(eq(writingSubmissions.userId, userId), eq(writingSubmissions.orgId, orgId)));

  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      authored: sql<number>`sum(case when ${writingTasks.origin} = 'authored' then 1 else 0 end)::int`,
      generated: sql<number>`sum(case when ${writingTasks.origin} = 'generated' then 1 else 0 end)::int`,
      unattempted: sql<number>`sum(case when ${writingTasks.id} not in (${done}) then 1 else 0 end)::int`,
    })
    .from(writingTasks)
    .where(eq(writingTasks.status, 'published'));

  return {
    total: row?.total ?? 0,
    authored: row?.authored ?? 0,
    generated: row?.generated ?? 0,
    unattempted: row?.unattempted ?? 0,
  };
}

export async function speakingPoolStatus(userId: string, orgId: string): Promise<PromptPoolStatus> {
  const done = db
    .select({ id: speakingSubmissions.taskId })
    .from(speakingSubmissions)
    .where(and(eq(speakingSubmissions.userId, userId), eq(speakingSubmissions.orgId, orgId)));

  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      authored: sql<number>`sum(case when ${speakingTasks.origin} = 'authored' then 1 else 0 end)::int`,
      generated: sql<number>`sum(case when ${speakingTasks.origin} = 'generated' then 1 else 0 end)::int`,
      unattempted: sql<number>`sum(case when ${speakingTasks.id} not in (${done}) then 1 else 0 end)::int`,
    })
    .from(speakingTasks)
    .where(eq(speakingTasks.status, 'published'));

  return {
    total: row?.total ?? 0,
    authored: row?.authored ?? 0,
    generated: row?.generated ?? 0,
    unattempted: row?.unattempted ?? 0,
  };
}

/** Top the writing bank up if the learner is close to having done all of it. */
export async function replenishWriting(
  userId: string,
  orgId: string,
  headroom = PROMPT_HEADROOM,
): Promise<number> {
  const status = await writingPoolStatus(userId, orgId);
  if (status.unattempted >= headroom) return 0;

  const seed = `${orgId}-w-${Date.now().toString(36)}-${status.total}`;
  let added = 0;
  for (let i = 0; i < 4; i++) {
    const task = generateWritingTask(`${seed}-${i}`);
    const result = validateWritingTask(task);
    const publishStatus = result.passed ? 'published' : 'in_review';

    await db
      .insert(writingTasks)
      .values({
        id: contentId('wtk', task.slug),
        slug: task.slug,
        taskType: task.taskType,
        title: task.title,
        scenario: task.scenario,
        instructions: task.instructions,
        requirements: JSON.stringify(task.requirements),
        choices: task.choices ? JSON.stringify(task.choices) : null,
        minWords: task.minWords,
        maxWords: task.maxWords,
        timeLimitSeconds: task.timeLimitSeconds,
        register: task.register,
        level: task.level,
        topic: task.topic,
        modelNotes: task.modelNotes,
        origin: 'generated',
        generatorSeed: seed,
        status: publishStatus,
      })
      .onConflictDoNothing({ target: writingTasks.slug });
    if (publishStatus === 'published') added++;
  }
  return added;
}

/**
 * Top the speaking bank up, one prompt per task type.
 *
 * Deliberately even across the eight: the task types are not interchangeable,
 * and a learner who is weak on Task 5 is not helped by three more of Task 2.
 */
export async function replenishSpeaking(
  userId: string,
  orgId: string,
  headroom = PROMPT_HEADROOM * 2,
): Promise<number> {
  const status = await speakingPoolStatus(userId, orgId);
  if (status.unattempted >= headroom) return 0;

  const seed = `${orgId}-s-${Date.now().toString(36)}-${status.total}`;
  let added = 0;
  for (const taskNumber of SPEAKING_TASK_NUMBERS) {
    const task = generateSpeakingTask(taskNumber, `${seed}-${taskNumber}`);
    const result = validateSpeakingTask(task);
    const publishStatus = result.passed ? 'published' : 'in_review';

    await db
      .insert(speakingTasks)
      .values({
        id: contentId('stk', task.slug),
        slug: task.slug,
        taskType: task.taskType,
        taskNumber: task.taskNumber,
        title: task.title,
        prompt: task.prompt,
        context: task.context ? JSON.stringify(task.context) : null,
        prepSeconds: task.prepSeconds,
        speakSeconds: task.speakSeconds,
        level: task.level,
        topic: task.topic,
        successCriteria: JSON.stringify(task.successCriteria),
        modelNotes: task.modelNotes,
        origin: 'generated',
        generatorSeed: seed,
        status: publishStatus,
      })
      .onConflictDoNothing({ target: speakingTasks.slug });
    if (publishStatus === 'published') added++;
  }
  return added;
}

export { notInArray };
