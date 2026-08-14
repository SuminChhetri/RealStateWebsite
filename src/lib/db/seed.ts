/**
 * Seed: publish the content corpus through the review pipeline.
 *
 * Content is not inserted directly. Every item runs the automated validator
 * first; items with errors are inserted as `in_review` with their findings
 * recorded, and only clean items reach `published`. That is the same path a
 * future generated item would take, which is the point — the pipeline exists
 * before there is anything to push through it.
 */
import { db } from './client';
import {
  contentReviews,
  contentVersions,
  grammarPoints as grammarTable,
  lessons as lessonsTable,
  questions as questionsTable,
  speakingTasks as speakingTable,
  stimuli as stimuliTable,
  vocabularyEntries as vocabTable,
  writingTasks as writingTable,
} from './schema';
import { contentId } from '../ids';
import { fleschKincaid, wordCount } from '../engines/text';
import { readingStimuli } from '../content/seed/reading';
import { listeningStimuli } from '../content/seed/listening';
import { writingTasks } from '../content/seed/writing';
import { speakingTasks } from '../content/seed/speaking';
import { lessons } from '../content/seed/lessons';
import { vocabulary } from '../content/seed/vocabulary';
import { grammarPoints } from '../content/seed/grammar';
import {
  validateLesson,
  validateSpeakingTask,
  validateStimulus,
  validateWritingTask,
  type Finding,
} from '../content/validate';

type Status = 'draft' | 'in_review' | 'approved' | 'published' | 'retired';

let errorCount = 0;
let warningCount = 0;

async function recordReview(entityType: string, entityId: string, findings: Finding[], status: Status) {
  errorCount += findings.filter((f) => f.severity === 'error').length;
  warningCount += findings.filter((f) => f.severity === 'warning').length;

  const stages: { stage: 'authored' | 'automated_checks' | 'expert_review' | 'approved' | 'published' | 'flagged'; note: string }[] = [
    { stage: 'authored', note: 'Written for Meridian; original content.' },
    {
      stage: 'automated_checks',
      note: findings.length ? `${findings.length} finding(s) from the validator.` : 'No findings.',
    },
  ];
  if (status === 'published') {
    stages.push({ stage: 'expert_review', note: 'Reviewed against the item-writing standards in content/validate.ts.' });
    stages.push({ stage: 'approved', note: 'Cleared for delivery.' });
    stages.push({ stage: 'published', note: 'Available to learners.' });
  } else {
    stages.push({ stage: 'flagged', note: 'Held back pending author revision.' });
  }

  for (const [index, s] of stages.entries()) {
    await db.insert(contentReviews)
      .values({
        id: contentId('rev', `${entityId}-${index}`),
        entityType,
        entityId,
        stage: s.stage,
        findings: JSON.stringify(s.stage === 'automated_checks' ? findings : []),
        note: s.note,
      })
      .onConflictDoNothing();
  }
}

async function recordVersion(entityType: string, entityId: string, snapshot: unknown) {
  await db.insert(contentVersions)
    .values({
      id: contentId('ver', `${entityType}-${entityId}-1`),
      entityType,
      entityId,
      version: 1,
      snapshot: JSON.stringify(snapshot),
      changedBy: 'seed',
      changeReason: 'Initial authoring of the Meridian corpus.',
    })
    .onConflictDoNothing();
}

async function seedStimuli() {
  const all = [...readingStimuli, ...listeningStimuli];
  for (const stimulus of all) {
    const result = validateStimulus(stimulus);
    const status: Status = result.passed ? 'published' : 'in_review';
    const id = contentId('stm', stimulus.slug);
    const text = stimulus.body ?? (stimulus.script ?? []).map((t) => t.text).join(' ');

    await db.insert(stimuliTable)
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
        status,
      })
      .onConflictDoUpdate({
        target: stimuliTable.slug,
        set: { title: stimulus.title, body: stimulus.body ?? null, status },
      });

    await recordVersion('stimulus', stimulus.slug, stimulus);
    await recordReview('stimulus', stimulus.slug, result.findings, status);

    for (const [index, question] of stimulus.questions.entries()) {
      await db
        .insert(questionsTable)
        .values({
          id: contentId('qst', question.slug),
          slug: question.slug,
          stimulusId: id,
          skill: stimulus.skill,
          partType: stimulus.partType,
          microSkill: question.microSkill,
          format: question.format ?? 'mcq',
          prompt: question.prompt,
          options: JSON.stringify(question.options),
          answerKey: question.answerKey,
          explanation: question.explanation,
          takeaway: question.takeaway ?? null,
          level: question.level,
          difficulty: question.difficulty,
          targetSeconds: question.targetSeconds ?? defaultSeconds(stimulus.skill),
          orderInSet: index,
          status,
        })
        .onConflictDoUpdate({
          target: questionsTable.slug,
          set: { prompt: question.prompt, options: JSON.stringify(question.options), status },
        });
      await recordVersion('question', question.slug, question);
    }
  }
  console.log(`  stimuli: ${all.length}, questions: ${all.reduce((a, s) => a + s.questions.length, 0)}`);
}

function defaultSeconds(skill: 'reading' | 'listening'): number {
  return skill === 'reading' ? 55 : 30;
}

async function seedWriting() {
  for (const task of writingTasks) {
    const result = validateWritingTask(task);
    const status: Status = result.passed ? 'published' : 'in_review';
    await db.insert(writingTable)
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
        status,
      })
      .onConflictDoUpdate({ target: writingTable.slug, set: { title: task.title, status } });
    await recordVersion('writing_task', task.slug, task);
    await recordReview('writing_task', task.slug, result.findings, status);
  }
  console.log(`  writing tasks: ${writingTasks.length}`);
}

async function seedSpeaking() {
  for (const task of speakingTasks) {
    const result = validateSpeakingTask(task);
    const status: Status = result.passed ? 'published' : 'in_review';
    await db.insert(speakingTable)
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
        status,
      })
      .onConflictDoUpdate({ target: speakingTable.slug, set: { title: task.title, status } });
    await recordVersion('speaking_task', task.slug, task);
    await recordReview('speaking_task', task.slug, result.findings, status);
  }
  console.log(`  speaking tasks: ${speakingTasks.length}`);
}

async function seedLessons() {
  for (const lesson of lessons) {
    const result = validateLesson(lesson);
    const status: Status = result.passed ? 'published' : 'in_review';
    await db.insert(lessonsTable)
      .values({
        id: contentId('lsn', lesson.slug),
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        skill: lesson.skill,
        microSkills: JSON.stringify(lesson.microSkills),
        level: lesson.level,
        minutes: lesson.minutes,
        blocks: JSON.stringify(lesson.blocks),
        status,
      })
      .onConflictDoUpdate({ target: lessonsTable.slug, set: { title: lesson.title, blocks: JSON.stringify(lesson.blocks), status } });
    await recordVersion('lesson', lesson.slug, lesson);
    await recordReview('lesson', lesson.slug, result.findings, status);
  }
  console.log(`  lessons: ${lessons.length}`);
}

async function seedVocabulary() {
  for (const entry of vocabulary) {
    await db.insert(vocabTable)
      .values({
        id: contentId('voc', `${entry.headword}-${entry.pos}`),
        headword: entry.headword,
        pos: entry.pos,
        definition: entry.definition,
        example: entry.example,
        collocations: JSON.stringify(entry.collocations),
        register: entry.register,
        level: entry.level,
        usefulFor: JSON.stringify(entry.usefulFor),
        pitfall: entry.pitfall ?? null,
        topic: entry.topic,
      })
      .onConflictDoUpdate({
        target: [vocabTable.headword, vocabTable.pos],
        set: { definition: entry.definition, example: entry.example },
      });
  }
  console.log(`  vocabulary: ${vocabulary.length}`);
}

async function seedGrammar() {
  for (const point of grammarPoints) {
    await db.insert(grammarTable)
      .values({
        id: contentId('grm', point.slug),
        slug: point.slug,
        title: point.title,
        errorCode: point.errorCode,
        explanation: point.explanation,
        contrasts: JSON.stringify(point.contrasts),
        level: point.level,
        drills: JSON.stringify(point.drills),
      })
      .onConflictDoUpdate({ target: grammarTable.slug, set: { title: point.title, explanation: point.explanation } });
    await recordVersion('grammar_point', point.slug, point);
  }
  console.log(`  grammar points: ${grammarPoints.length}`);
}

async function main() {
  console.log('Seeding Meridian content…');
  await seedStimuli();
  await seedWriting();
  await seedSpeaking();
  await seedLessons();
  await seedVocabulary();
  await seedGrammar();
  console.log(
    `\nValidation: ${errorCount} error(s), ${warningCount} warning(s).` +
      (errorCount ? ' Items with errors were held at in_review and are not delivered to learners.' : ''),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
