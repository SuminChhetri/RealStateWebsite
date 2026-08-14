import type { SeedQuestion, SeedStimulus } from '../seed/types';
import { grammarPoints } from '../seed/grammar';
import { vocabulary } from '../seed/vocabulary';
import { generateDialogueStimulus } from './dialogue';
import { generateLexicalItem } from './lexical';
import { generateScheduleStimulus } from './schedule';
import { generateUsageItem } from './usage';

export { Rng } from './rng';
export { generateDialogueStimulus } from './dialogue';
export { blank, clozeCandidates, generateLexicalItem } from './lexical';
export { generateScheduleStimulus } from './schedule';
export { generateUsageItem } from './usage';

/**
 * The generated half of the item bank.
 *
 * The product promises unlimited practice. A fixed corpus cannot keep that
 * promise — a committed learner exhausts a few hundred authored items in a
 * fortnight, and from then on is re-answering questions they remember. So the
 * bank has two halves, and the difference between them is stated rather than
 * blurred:
 *
 *   **Authored** items are written and reviewed by a person. They carry the
 *   judgement calls — argument, tone, inference, register — that nothing else
 *   can supply, and they are what the ability estimate leans on.
 *
 *   **Generated** items are composed here, from structured data, for the
 *   micro-skills where correctness is decidable: locating information in a
 *   table, choosing a word whose meaning is documented, applying a grammar rule
 *   that is written down. Every key is computed or authored upstream; none is
 *   invented at generation time.
 *
 * What this deliberately is not: there is no language model anywhere in this
 * path, and no claim that a generated item is equivalent to an authored one.
 * Generated items are marked in the database, marked in the interface, and
 * weighted lower when the ability estimate updates — see `attemptWeight`.
 */

export type GeneratorKind = 'schedule' | 'lexical' | 'usage' | 'dialogue';

/**
 * Micro-skills a generator can produce defensible items for.
 *
 * The list is short on purpose. It covers the skills where the answer is a
 * fact — locating it, holding it, not being pulled off it — and stops before
 * the ones that require a judgement about how something was said or meant.
 * Gist, attitude, inference and speaker relationship are absent here and are
 * authored, because a template has no view about tone.
 */
export const GENERATED_MICRO_SKILLS: Record<GeneratorKind, string[]> = {
  schedule: ['reading.information_matching', 'reading.scanning_speed', 'reading.literal_detail'],
  lexical: ['reading.vocabulary_in_context'],
  usage: ['reading.gap_completion'],
  dialogue: ['listening.detail_recall', 'listening.distractor_resistance', 'listening.note_taking'],
};

/**
 * How much a generated item counts toward the ability estimate.
 *
 * Not zero: the items are real and answering them is evidence. Not one either:
 * their difficulty is assigned from the source data rather than measured
 * against a population, so treating them as equal to a calibrated authored item
 * would overstate the precision of the estimate. Two-thirds is a judgement, and
 * it is recorded here as one rather than buried in the update step.
 */
export const GENERATED_ITEM_WEIGHT = 0.65;

export interface GeneratedBatch {
  /** Reading passages and listening encounters, each with their own items. */
  stimuli: SeedStimulus[];
  /** Items with no stimulus of their own — vocabulary and usage. */
  standalone: SeedQuestion[];
}

/**
 * Produce a batch of fresh material.
 *
 * `seed` makes the batch reproducible: the same seed yields the same items,
 * byte for byte, which is what allows a generated item to be reviewed, reported
 * or reproduced later from the seed stored on its row.
 */
export function generateBatch(
  seed: string,
  size = 3,
  skill: 'reading' | 'listening' | 'both' = 'both',
): GeneratedBatch {
  const stimuli: SeedStimulus[] = [];
  const standalone: SeedQuestion[] = [];

  if (skill !== 'listening') {
    for (let i = 0; i < size; i++) {
      // A generator that cannot build a defensible set from its sample returns
      // null; the slot is simply skipped rather than filled with a weaker item.
      const stimulus = generateScheduleStimulus(`${seed}-s${i}`, 5);
      if (stimulus) stimuli.push(stimulus);
    }
  }

  if (skill !== 'reading') {
    for (let i = 0; i < size; i++) {
      const encounter = generateDialogueStimulus(`${seed}-d${i}`);
      if (encounter) stimuli.push(encounter);
    }
  }

  if (skill === 'listening') return { stimuli, standalone };

  for (let i = 0; i < size * 2; i++) {
    const lexical = generateLexicalItem(vocabulary, `${seed}-l${i}`, i);
    if (lexical) standalone.push(lexical);
    const usage = generateUsageItem(grammarPoints, `${seed}-u${i}`, i);
    if (usage) standalone.push(usage);
  }

  return { stimuli, standalone };
}
