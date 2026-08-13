/**
 * Automated content validation — stage two of the review pipeline.
 *
 * Nothing reaches `published` without passing these checks. They encode the
 * item-writing standards that would otherwise live in a style guide nobody
 * reads: one defensible key, distractors that are plausible and distinct,
 * explanations that teach rather than restate, and difficulty that is
 * consistent with the level the item claims.
 *
 * Findings are stored against the content row, so the content console shows
 * why an item is held back rather than silently dropping it.
 */
import { fleschKincaid, sentences, wordCount, words } from '../engines/text';
import { tryMicroSkill } from './taxonomy';
import type { SeedLesson, SeedSpeakingTask, SeedStimulus, SeedWritingTask } from './seed/types';

export interface Finding {
  check: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface ValidationResult {
  entityType: string;
  entityId: string;
  findings: Finding[];
  passed: boolean;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export function validateStimulus(stimulus: SeedStimulus): ValidationResult {
  const findings: Finding[] = [];
  const text = stimulus.body ?? (stimulus.script ?? []).map((t) => t.text).join(' ');

  if (!text.trim()) findings.push({ check: 'stimulus.body', severity: 'error', message: 'Stimulus has no body or script.' });

  const wc = wordCount(text);
  if (stimulus.skill === 'reading') {
    if (wc < 120) findings.push({ check: 'stimulus.length', severity: 'warning', message: `Reading stimulus is short (${wc} words).` });
    if (wc > 900) findings.push({ check: 'stimulus.length', severity: 'warning', message: `Reading stimulus is long (${wc} words) for its part type.` });
    // Difficulty should track the claimed level: a CLB 11 passage written at a
    // grade-6 reading level is mislabelled, and so is the reverse.
    const grade = fleschKincaid(text);
    const expected = stimulus.level - 2.5;
    if (Math.abs(grade - expected) > 4.5) {
      findings.push({
        check: 'stimulus.readability',
        severity: 'info',
        message: `Flesch–Kincaid grade ${grade} sits far from the range expected for CLB ${stimulus.level}. Review the calibration.`,
      });
    }
  }

  if (stimulus.skill === 'listening') {
    if (!stimulus.script?.length) {
      findings.push({ check: 'stimulus.script', severity: 'error', message: 'Listening stimulus has no script turns.' });
    } else {
      const voices = new Set(stimulus.script.map((t) => t.voice));
      if (voices.size < 2) {
        findings.push({ check: 'stimulus.voices', severity: 'warning', message: 'Only one voice is used; speakers will be hard to distinguish.' });
      }
      const spoken = stimulus.script.filter((t) => t.voice !== 'narrator');
      const avgTurn = spoken.length ? spoken.reduce((a, t) => a + wordCount(t.text), 0) / spoken.length : 0;
      if (avgTurn > 90) {
        findings.push({ check: 'stimulus.turn_length', severity: 'info', message: `Average turn is ${Math.round(avgTurn)} words; long turns reduce conversational realism.` });
      }
    }
  }

  const questionFindings = stimulus.questions.flatMap((q) => validateQuestion(q, text).findings.map((f) => ({ ...f, message: `${q.slug}: ${f.message}` })));
  findings.push(...questionFindings);

  const microSkills = new Set(stimulus.questions.map((q) => q.microSkill));
  if (stimulus.questions.length >= 5 && microSkills.size < 3) {
    findings.push({
      check: 'set.coverage',
      severity: 'warning',
      message: `Set covers only ${microSkills.size} micro-skills; sets should spread across the part type's skills.`,
    });
  }

  // Key position is not a quality signal in this product: options are shuffled
  // per attempt at delivery (see lib/practice/delivery.ts), which removes
  // position bias more reliably than balancing the source order. The check is
  // kept as information so an author can still see an unusual distribution.
  const keyDistribution = new Map<string, number>();
  for (const q of stimulus.questions) keyDistribution.set(q.answerKey, (keyDistribution.get(q.answerKey) ?? 0) + 1);
  for (const [key, count] of keyDistribution) {
    if (stimulus.questions.length >= 6 && count / stimulus.questions.length > 0.5) {
      findings.push({
        check: 'set.key_balance',
        severity: 'info',
        message: `Answer key "${key}" accounts for ${count} of ${stimulus.questions.length} items in the source order. Delivery shuffles options per attempt, so this does not affect learners.`,
      });
    }
  }

  return {
    entityType: 'stimulus',
    entityId: stimulus.slug,
    findings,
    passed: !findings.some((f) => f.severity === 'error'),
  };
}

export function validateQuestion(
  question: SeedStimulus['questions'][number],
  stimulusText: string,
): ValidationResult {
  const findings: Finding[] = [];

  if (!tryMicroSkill(question.microSkill)) {
    findings.push({ check: 'question.micro_skill', severity: 'error', message: `Unknown micro-skill "${question.microSkill}".` });
  }

  const keys = question.options.map((o) => o.key);
  if (new Set(keys).size !== keys.length) {
    findings.push({ check: 'question.option_keys', severity: 'error', message: 'Duplicate option keys.' });
  }
  if (keys.length < 3) {
    findings.push({ check: 'question.option_count', severity: 'error', message: 'Fewer than three options.' });
  }
  if (!keys.every((k) => OPTION_KEYS.includes(k))) {
    findings.push({ check: 'question.option_keys', severity: 'warning', message: 'Option keys outside A–D.' });
  }
  if (!keys.includes(question.answerKey)) {
    findings.push({ check: 'question.answer_key', severity: 'error', message: 'Answer key does not match any option.' });
  }

  const texts = question.options.map((o) => o.text.trim().toLowerCase());
  if (new Set(texts).size !== texts.length) {
    findings.push({ check: 'question.duplicate_options', severity: 'error', message: 'Two options are identical.' });
  }

  // A key that is markedly longer than the distractors is a giveaway.
  const lengths = question.options.map((o) => wordCount(o.text));
  const keyIndex = question.options.findIndex((o) => o.key === question.answerKey);
  if (keyIndex >= 0) {
    const keyLength = lengths[keyIndex];
    const others = lengths.filter((_, i) => i !== keyIndex);
    const maxOther = Math.max(...others, 0);
    if (keyLength > maxOther * 1.8 && keyLength - maxOther > 6) {
      findings.push({
        check: 'question.key_length',
        severity: 'warning',
        message: 'The key is much longer than every distractor, which cues the answer.',
      });
    }
  }

  for (const option of question.options) {
    if (!option.rationale || wordCount(option.rationale) < 4) {
      findings.push({ check: 'question.rationale', severity: 'error', message: `Option ${option.key} has no substantive rationale.` });
    }
  }

  // Exactly one rationale should present itself as the key.
  const correctMarkers = question.options.filter((o) => /^correct\b/i.test(o.rationale.trim()));
  if (correctMarkers.length > 1) {
    findings.push({
      check: 'question.multiple_keys',
      severity: 'error',
      message: `${correctMarkers.length} rationales are written as the correct answer.`,
    });
  }
  if (correctMarkers.length === 1 && correctMarkers[0].key !== question.answerKey) {
    findings.push({
      check: 'question.key_mismatch',
      severity: 'error',
      message: `Rationale marks option ${correctMarkers[0].key} as correct but the key is ${question.answerKey}.`,
    });
  }

  if (wordCount(question.explanation) < 15) {
    findings.push({ check: 'question.explanation', severity: 'warning', message: 'Explanation is too brief to teach anything.' });
  }
  if (/^the answer is/i.test(question.explanation.trim())) {
    findings.push({ check: 'question.explanation', severity: 'warning', message: 'Explanation restates the answer instead of explaining the move.' });
  }

  if (Math.abs(question.difficulty - question.level) > 2) {
    findings.push({
      check: 'question.difficulty',
      severity: 'info',
      message: `Difficulty ${question.difficulty} is far from the stated level ${question.level}.`,
    });
  }

  // The item must not be answerable from the options alone: at least one
  // content word of the key should appear in the stimulus.
  if (stimulusText) {
    const key = question.options.find((o) => o.key === question.answerKey);
    if (key) {
      const keyWords = words(key.text).filter((w) => w.length > 5);
      const stimulusWords = new Set(words(stimulusText));
      const anchored = keyWords.some((w) => stimulusWords.has(w));
      if (keyWords.length >= 3 && !anchored) {
        findings.push({
          check: 'question.anchoring',
          severity: 'info',
          message: 'No distinctive word from the key appears in the stimulus. Confirm the item is genuinely text-dependent.',
        });
      }
    }
  }

  return {
    entityType: 'question',
    entityId: question.slug,
    findings,
    passed: !findings.some((f) => f.severity === 'error'),
  };
}

export function validateWritingTask(task: SeedWritingTask): ValidationResult {
  const findings: Finding[] = [];
  if (task.requirements.length < 3) {
    findings.push({ check: 'writing.requirements', severity: 'warning', message: 'Fewer than three required content points.' });
  }
  if (task.minWords >= task.maxWords) {
    findings.push({ check: 'writing.word_range', severity: 'error', message: 'Minimum word count is not below the maximum.' });
  }
  if (task.taskType === 'writing.survey' && (!task.choices || task.choices.length !== 2)) {
    findings.push({ check: 'writing.choices', severity: 'error', message: 'Survey tasks need exactly two options.' });
  }
  // Survey tasks carry their detail in the two options rather than the scenario.
  const briefingLength = wordCount(task.scenario) + wordCount((task.choices ?? []).join(' '));
  if (briefingLength < 45) {
    findings.push({ check: 'writing.scenario', severity: 'warning', message: 'Scenario and options together may not give enough detail to write from.' });
  }
  if (wordCount(task.modelNotes) < 40) {
    findings.push({ check: 'writing.model_notes', severity: 'warning', message: 'Model notes are too thin to guide a revision.' });
  }
  if (/model answer|sample answer/i.test(task.modelNotes)) {
    findings.push({ check: 'writing.model_notes', severity: 'warning', message: 'Model notes should describe moves, not supply an answer to copy.' });
  }
  return { entityType: 'writing_task', entityId: task.slug, findings, passed: !findings.some((f) => f.severity === 'error') };
}

export function validateSpeakingTask(task: SeedSpeakingTask): ValidationResult {
  const findings: Finding[] = [];
  if (task.successCriteria.length < 3) {
    findings.push({ check: 'speaking.criteria', severity: 'warning', message: 'Fewer than three success criteria; coaching will be thin.' });
  }
  const expected: Record<number, [number, number]> = {
    1: [30, 90], 2: [30, 60], 3: [30, 60], 4: [30, 60],
    5: [60, 60], 6: [60, 60], 7: [30, 90], 8: [30, 60],
  };
  const want = expected[task.taskNumber];
  if (want && (task.prepSeconds !== want[0] || task.speakSeconds !== want[1])) {
    findings.push({
      check: 'speaking.timing',
      severity: 'warning',
      message: `Timing ${task.prepSeconds}/${task.speakSeconds}s differs from the ${want[0]}/${want[1]}s shape for task ${task.taskNumber}.`,
    });
  }
  if ((task.taskNumber === 3 || task.taskNumber === 4 || task.taskNumber === 8) && !task.context?.scene) {
    findings.push({ check: 'speaking.scene', severity: 'error', message: 'Description and prediction tasks require a scene.' });
  }
  if ((task.taskNumber === 5 || task.taskNumber === 6) && (task.context?.options?.length ?? 0) !== 2) {
    findings.push({ check: 'speaking.options', severity: 'error', message: 'Comparison and difficult-situation tasks require exactly two options.' });
  }
  return { entityType: 'speaking_task', entityId: task.slug, findings, passed: !findings.some((f) => f.severity === 'error') };
}

export function validateLesson(lesson: SeedLesson): ValidationResult {
  const findings: Finding[] = [];
  const hasRetrieval = lesson.blocks.some((b) => b.type === 'checkpoint' || b.type === 'drill');
  if (!hasRetrieval) {
    findings.push({
      check: 'lesson.retrieval',
      severity: 'error',
      message: 'Lesson has no checkpoint or drill. Reading without retrieval does not produce durable learning.',
    });
  }
  for (const block of lesson.blocks) {
    if (block.type === 'checkpoint') {
      const correct = block.options.filter((o) => o.correct);
      if (correct.length !== 1) {
        findings.push({ check: 'lesson.checkpoint', severity: 'error', message: 'Checkpoint must have exactly one correct option.' });
      }
      if (block.options.some((o) => !o.feedback)) {
        findings.push({ check: 'lesson.checkpoint', severity: 'error', message: 'Every checkpoint option needs feedback.' });
      }
    }
  }
  const prose = lesson.blocks.filter((b) => b.type === 'prose').map((b) => (b as { text: string }).text).join(' ');
  const proseSentences = sentences(prose).length;
  if (proseSentences > 24) {
    findings.push({ check: 'lesson.length', severity: 'warning', message: 'Prose is long for a lesson of this duration.' });
  }
  for (const slug of lesson.microSkills) {
    if (!tryMicroSkill(slug)) {
      findings.push({ check: 'lesson.micro_skill', severity: 'error', message: `Unknown micro-skill "${slug}".` });
    }
  }
  return { entityType: 'lesson', entityId: lesson.slug, findings, passed: !findings.some((f) => f.severity === 'error') };
}
