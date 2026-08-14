import type { SeedGrammarPoint, SeedQuestion } from '../seed/types';
import { Rng } from './rng';

/**
 * Generated usage items, built from the authored grammar points.
 *
 * **Why this can be generated honestly.** Every grammar point carries a set of
 * contrasts, each an authored triple: the sentence learners write, the sentence
 * they should write, and why. An item is assembled by putting one corrected
 * sentence beside three uncorrected ones and attaching each contrast's own
 * explanation as the rationale. The key is decided by the rule the point
 * teaches, and the feedback is the explanation a teacher already wrote. The
 * generator chooses combinations; it does not write English or adjudicate it.
 *
 * Two shapes are produced from the same source, because they train different
 * things: recognising the correct form among plausible wrong ones, and locating
 * the error inside a sentence that looks fine at a glance.
 */

interface Contrast {
  wrong: string;
  right: string;
  why: string;
  point: SeedGrammarPoint;
}

/**
 * Some authored explanations are deliberately terse — "Same rule.", "One marker
 * only." — because in the grammar point they sit directly under a fuller one
 * and inherit its context. Lifted out into an item they explain nothing, so
 * they are not eligible here. The corpus is right and the generator has to know
 * what it can carry.
 */
function standsAlone(why: string): boolean {
  return why.trim().split(/\s+/).length >= 6;
}

function allContrasts(points: SeedGrammarPoint[]): Contrast[] {
  return points
    .flatMap((point) => point.contrasts.map((c) => ({ ...c, point })))
    .filter((c) => standsAlone(c.why));
}

/** "Which sentence is correct?" — three near-misses against one clean sentence. */
function correctFormItem(contrasts: Contrast[], rng: Rng, seed: string, index: number): SeedQuestion | null {
  if (contrasts.length < 4) return null;
  const answer = rng.pick(contrasts);
  // Distractors from other points, so the item is not four variations of one
  // rule — that would let a learner answer by pattern rather than by knowing.
  const others = contrasts.filter((c) => c.point.slug !== answer.point.slug);
  if (others.length < 3) return null;

  const picked = rng.sample(others, 3);
  const shuffled = rng.shuffle([
    {
      text: answer.right,
      rationale: `Correct. ${answer.why} This is the “${answer.point.title}” rule.`,
      correct: true,
    },
    ...picked.map((c) => ({
      text: c.wrong,
      rationale: `Not this one. ${c.why} The corrected form is “${c.right}”.`,
      correct: false,
    })),
  ]);

  const options = shuffled.map((option, i) => ({
    key: ['A', 'B', 'C', 'D'][i],
    text: option.text,
    rationale: option.rationale,
  }));

  return {
    slug: `gen-usage-${seed}-${index}`,
    microSkill: 'reading.gap_completion',
    prompt: 'Which sentence is written correctly?',
    options,
    answerKey: options[shuffled.findIndex((o) => o.correct)].key,
    explanation: `${answer.why} The rule behind it: ${answer.point.explanation.split('. ')[0]}.`,
    takeaway: `This is the “${answer.point.title}” pattern. It is worth fixing because it appears in almost every long piece of writing, so one rule earns marks repeatedly.`,
    level: answer.point.level,
    difficulty: answer.point.level - 0.5,
    targetSeconds: 45,
  };
}

/** "What is wrong with this sentence?" — the error is there; name it. */
function findErrorItem(contrasts: Contrast[], rng: Rng, seed: string, index: number): SeedQuestion | null {
  if (contrasts.length < 4) return null;
  const target = rng.pick(contrasts);
  const others = contrasts.filter((c) => c.point.slug !== target.point.slug);
  if (others.length < 3) return null;

  const wrongPoints = rng.sample(
    others.filter((c, i, list) => list.findIndex((x) => x.point.slug === c.point.slug) === i),
    3,
  );
  if (wrongPoints.length < 3) return null;

  const shuffled = rng.shuffle([
    {
      text: target.point.title,
      rationale: `Correct. ${target.why} Written correctly: “${target.right}”.`,
      correct: true,
    },
    ...wrongPoints.map((c) => ({
      text: c.point.title,
      rationale: `This sentence does not break that rule. “${c.point.title}” is about a different pattern — compare “${c.wrong}”, which does.`,
      correct: false,
    })),
  ]);

  const options = shuffled.map((option, i) => ({
    key: ['A', 'B', 'C', 'D'][i],
    text: option.text,
    rationale: option.rationale,
  }));

  return {
    slug: `gen-usage-${seed}-${index}`,
    microSkill: 'reading.gap_completion',
    prompt: `One rule is broken in this sentence. Which one?\n\n“${target.wrong}”`,
    options,
    answerKey: options[shuffled.findIndex((o) => o.correct)].key,
    explanation: `${target.why} Corrected: “${target.right}”.`,
    takeaway: 'Naming the rule you broke is what makes the correction stick. An error you can only feel is one you will make again under time pressure.',
    level: target.point.level + 1,
    difficulty: target.point.level + 0.3,
    targetSeconds: 50,
  };
}

export function generateUsageItem(
  points: SeedGrammarPoint[],
  seed: string,
  index: number,
): SeedQuestion | null {
  const rng = new Rng(seed);
  const contrasts = allContrasts(points);
  const builder = rng.next() < 0.5 ? correctFormItem : findErrorItem;
  return builder(contrasts, rng, seed, index) ?? correctFormItem(contrasts, rng, seed, index);
}
