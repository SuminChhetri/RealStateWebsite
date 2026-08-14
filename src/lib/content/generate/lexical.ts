import type { SeedQuestion } from '../seed/types';
import type { SeedVocabulary } from '../seed/types';
import { Rng } from './rng';

/**
 * Generated vocabulary-in-context items.
 *
 * **Why this can be generated honestly.** Each item blanks a curated headword
 * out of the example sentence that was authored for it, and offers three other
 * curated headwords of the same part of speech as distractors. Nothing is
 * invented: the key is the word the sentence was written around, and each
 * distractor's rationale is that entry's own authored definition, which is what
 * makes it the wrong fit. The generator's contribution is combinatorial — which
 * four entries meet on a page — not authorial.
 *
 * The guard that keeps this sound is `blank()`. If the headword cannot be
 * located in its example with confidence, the entry is skipped rather than
 * mangled, because a cloze with the wrong span removed has no defensible key.
 */

/** Inflected forms worth recognising, longest first so "-ies" beats "-s". */
function surfaceForms(headword: string): string[] {
  const w = headword.toLowerCase();
  const forms = new Set<string>([w]);
  if (w.endsWith('e')) {
    forms.add(`${w}d`);
    forms.add(`${w.slice(0, -1)}ing`);
  } else if (w.endsWith('y')) {
    forms.add(`${w.slice(0, -1)}ies`);
    forms.add(`${w.slice(0, -1)}ied`);
    forms.add(`${w}ing`);
  } else {
    forms.add(`${w}ed`);
    forms.add(`${w}ing`);
  }
  forms.add(`${w}s`);
  forms.add(`${w}es`);
  return [...forms].sort((a, b) => b.length - a.length);
}

/**
 * Replace the headword in its example with a blank.
 *
 * Multi-word entries are matched as a phrase. Returns null when no form is
 * found, which is a deliberate refusal rather than a fallback.
 */
export function blank(entry: SeedVocabulary): { text: string; removed: string } | null {
  const candidates = entry.headword.includes(' ')
    ? [entry.headword.toLowerCase()]
    : surfaceForms(entry.headword);

  for (const form of candidates) {
    const pattern = new RegExp(`\\b${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const match = entry.example.match(pattern);
    if (match) {
      return { text: entry.example.replace(pattern, '______'), removed: match[0] };
    }
  }
  return null;
}

/** Entries usable as cloze items — exported so the corpus test can assert coverage. */
export function clozeCandidates(corpus: SeedVocabulary[]): SeedVocabulary[] {
  return corpus.filter((entry) => blank(entry) !== null);
}

export function generateLexicalItem(
  corpus: SeedVocabulary[],
  seed: string,
  index: number,
): SeedQuestion | null {
  const rng = new Rng(seed);
  const usable = clozeCandidates(corpus);
  if (usable.length < 4) return null;

  const entry = rng.pick(usable);
  const removed = blank(entry);
  if (!removed) return null;

  // Same part of speech, so the item tests meaning rather than grammar — a
  // distractor that cannot fit syntactically is a free elimination.
  const sameClass = usable.filter(
    (candidate) => candidate.pos === entry.pos && candidate.headword !== entry.headword,
  );
  if (sameClass.length < 3) return null;

  const distractors = rng.sample(sameClass, 3);
  const keyed = rng.shuffle([
    {
      text: entry.headword,
      rationale: `Correct. ${capitalise(entry.definition)}, which is exactly what the sentence needs here.`,
      correct: true,
    },
    ...distractors.map((d) => ({
      text: d.headword,
      rationale: `${capitalise(d.definition)}. That is a real word in this register, but it does not carry the meaning this sentence is building toward.`,
      correct: false,
    })),
  ]);

  const options = keyed.map((option, i) => ({
    key: ['A', 'B', 'C', 'D'][i],
    text: option.text,
    rationale: option.rationale,
  }));
  const answerKey = options[keyed.findIndex((o) => o.correct)].key;

  const collocation = entry.collocations[0];

  return {
    slug: `gen-lex-${seed}-${index}`,
    microSkill: 'reading.vocabulary_in_context',
    format: 'blank_choice',
    prompt: `Choose the word that best completes the sentence.\n\n${removed.text}`,
    options,
    answerKey,
    explanation: `${capitalise(entry.headword)} means ${entry.definition}. ${
      entry.pitfall ? `${entry.pitfall} ` : ''
    }A reliable check is the collocation: “${collocation}” is the pattern this word appears in, and the sentence matches it.`,
    takeaway: `Learn ${entry.headword} with its collocations (${entry.collocations.slice(0, 2).join(', ')}), not on its own. A word you can only define is a word you will use slightly wrong.`,
    level: entry.level,
    difficulty: entry.level - 0.4,
    targetSeconds: 40,
  };
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
