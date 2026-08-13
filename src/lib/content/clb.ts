/**
 * CLB progression model.
 *
 * Meridian reports *practice level estimates* on the Canadian Language
 * Benchmarks scale. These are estimates produced by Meridian's own analysers
 * from a learner's practice history — they are not CELPIP scores and carry no
 * official standing. Every surface that displays a number must pair it with
 * the language in `ESTIMATE_DISCLAIMER`.
 *
 * The descriptors below are original prose written for this product: they
 * describe, in behavioural terms, what a learner does differently at each
 * level so the "what separates me from the next level" view is concrete
 * rather than motivational filler.
 */
import type { Skill } from './taxonomy';

export const MIN_LEVEL = 4;
export const MAX_LEVEL = 12;

export const ESTIMATE_DISCLAIMER =
  'A Meridian practice estimate from your own practice history. It is not a CELPIP score and has no official standing.';

export interface LevelDescriptor {
  level: number;
  /** What the learner reliably does at this level. */
  can: string;
  /** The specific behaviour that still holds them below the next level. */
  ceiling: string;
  /** The single highest-leverage change to move up one level. */
  lever: string;
}

const reading: LevelDescriptor[] = [
  {
    level: 5,
    can: 'Understands short, predictable texts when the wording is close to what you already know.',
    ceiling: 'Meaning collapses when the answer is paraphrased instead of repeated.',
    lever: 'Practise matching an idea to a differently-worded option before worrying about speed.',
  },
  {
    level: 6,
    can: 'Follows everyday correspondence and simple informational text with reasonable accuracy.',
    ceiling: 'Long sentences with embedded clauses cause you to lose the main verb.',
    lever: 'Read for the subject–verb backbone of long sentences before reading for detail.',
  },
  {
    level: 7,
    can: 'Handles workplace and community texts, and gets most stated detail right.',
    ceiling: 'Inference questions get answered from world knowledge rather than the text.',
    lever: 'For every inference answer, name the words in the text that force it.',
  },
  {
    level: 8,
    can: 'Reads a full argument and identifies the writer’s position with confidence.',
    ceiling: 'Distractors that reuse the passage’s vocabulary still pull you in.',
    lever: 'Eliminate options by finding the one word that makes each one false.',
  },
  {
    level: 9,
    can: 'Handles abstract and analytical text, and tracks reference across paragraphs.',
    ceiling: 'Tone and stance questions come down to a coin flip between two options.',
    lever: 'Annotate evaluative language — hedges, intensifiers, concessives — as you read.',
  },
  {
    level: 10,
    can: 'Reads dense material efficiently and separates claim from evidence automatically.',
    ceiling: 'Accuracy drops in the last part of a section as time pressure builds.',
    lever: 'Rehearse the section under a stricter clock than the real one.',
  },
  {
    level: 11,
    can: 'Handles nuance, irony and qualified positions with very few errors.',
    ceiling: 'The remaining errors cluster in purpose-of-a-paragraph and function questions.',
    lever: 'For each paragraph, write four words naming its job in the argument.',
  },
  {
    level: 12,
    can: 'Reads with the speed and precision of a proficient professional reader in English.',
    ceiling: 'Nothing systematic remains; performance is limited by attention, not ability.',
    lever: 'Maintain with mixed full-length sections; protect accuracy on low-frequency topics.',
  },
];

const listening: LevelDescriptor[] = [
  {
    level: 5,
    can: 'Understands short exchanges on familiar subjects when speech is clear and unhurried.',
    ceiling: 'Numbers, names and times slip away while you process the sentence.',
    lever: 'Practise capturing one detail type per listen until it becomes automatic.',
  },
  {
    level: 6,
    can: 'Follows everyday conversation and gets the main point reliably.',
    ceiling: 'A speaker who corrects themselves mid-sentence leaves you with the wrong fact.',
    lever: 'Train on self-correction: “actually”, “make that”, “sorry, I meant”.',
  },
  {
    level: 7,
    can: 'Handles multi-turn conversation and informational audio at natural speed.',
    ceiling: 'You hear the words but miss what the speaker is doing with them.',
    lever: 'After each clip, name the speaker’s move: conceding, warning, correcting.',
  },
  {
    level: 8,
    can: 'Follows discussion between several speakers and keeps their positions separate.',
    ceiling: 'Polite disagreement gets heard as agreement.',
    lever: 'Study hedged disagreement patterns and predict what follows “that said”.',
  },
  {
    level: 9,
    can: 'Understands extended argument, including implied attitude and unstated conclusions.',
    ceiling: 'Dense stretches force you to choose between following detail and following logic.',
    lever: 'Note structure, not words: one symbol per idea, arrows for relationships.',
  },
  {
    level: 10,
    can: 'Handles abstract, fast and unfamiliar-topic audio with high accuracy.',
    ceiling: 'Errors concentrate in the final parts, where speakers qualify their claims.',
    lever: 'Rehearse viewpoint sections specifically; they carry the hardest inference load.',
  },
  {
    level: 11,
    can: 'Catches nuance, humour and implication at natural conversational speed.',
    ceiling: 'Occasional lapses when two speakers agree on the conclusion for different reasons.',
    lever: 'Practise separating position from reasoning for each speaker.',
  },
  {
    level: 12,
    can: 'Listens like a proficient professional: nothing about speed or abstraction impedes you.',
    ceiling: 'Nothing systematic remains.',
    lever: 'Maintain with full sections on unfamiliar topics; keep note-taking light.',
  },
];

const writing: LevelDescriptor[] = [
  {
    level: 5,
    can: 'Writes short, simple messages that get the basic purpose across.',
    ceiling: 'Errors in basic sentence structure interrupt the reader.',
    lever: 'Build accuracy on simple sentences before adding complexity.',
  },
  {
    level: 6,
    can: 'Completes routine correspondence, covering the required points briefly.',
    ceiling: 'Points are mentioned but never developed, so the message reads thin.',
    lever: 'Give every point a reason and a consequence — two extra sentences each.',
  },
  {
    level: 7,
    can: 'Writes clear, organised messages with adequate control of common structures.',
    ceiling: 'Register drifts: a formal message picks up casual phrasing.',
    lever: 'Choose the reader before you write, and hold one register throughout.',
  },
  {
    level: 8,
    can: 'Produces well-organised responses with paragraphs that each do one job.',
    ceiling: 'Vocabulary is accurate but general; the same few verbs carry every sentence.',
    lever: 'Replace three general verbs per response with precise, natural collocations.',
  },
  {
    level: 9,
    can: 'Argues a position with developed support and controlled complex sentences.',
    ceiling: 'Cohesion relies on connectors rather than on how information is ordered.',
    lever: 'Start sentences with known information and end with the new point.',
  },
  {
    level: 10,
    can: 'Writes persuasively and precisely, with errors that never obscure meaning.',
    ceiling: 'Under the clock, the final paragraph loses the quality of the first.',
    lever: 'Plan three minutes, write twelve, and reserve two to fix the ending.',
  },
  {
    level: 11,
    can: 'Handles nuance, concession and qualification with a confident, consistent voice.',
    ceiling: 'A little padding remains: restated prompts, empty intensifiers.',
    lever: 'Cut ten per cent of every draft without losing content.',
  },
  {
    level: 12,
    can: 'Writes with the range, accuracy and economy expected of a proficient professional.',
    ceiling: 'Nothing systematic remains.',
    lever: 'Maintain with timed full tasks on unfamiliar topics; protect the closing move.',
  },
];

const speaking: LevelDescriptor[] = [
  {
    level: 5,
    can: 'Gets a simple message across on familiar topics, with pauses to search for words.',
    ceiling: 'Long silences and restarts break the listener’s attention.',
    lever: 'Rehearse a fixed opening move so the first ten seconds are never wasted.',
  },
  {
    level: 6,
    can: 'Speaks continuously about everyday matters with a recognisable structure.',
    ceiling: 'Responses stop early, leaving a third of the time unused.',
    lever: 'Practise adding one example and one consequence to every point.',
  },
  {
    level: 7,
    can: 'Completes each task’s communicative job and is understood without effort.',
    ceiling: 'Points are asserted rather than supported, so answers feel like lists.',
    lever: 'Use a claim → because → for example → so chain out loud.',
  },
  {
    level: 8,
    can: 'Organises spoken answers clearly with reasons and relevant detail.',
    ceiling: 'Fillers and self-repairs cluster where you plan the next sentence.',
    lever: 'Replace vocalised hesitation with a short silent pause at idea boundaries.',
  },
  {
    level: 9,
    can: 'Speaks fluently on abstract topics with good range and mostly accurate grammar.',
    ceiling: 'Complex structures are avoided rather than controlled.',
    lever: 'Deliberately use one conditional and one concessive per response.',
  },
  {
    level: 10,
    can: 'Sustains a persuasive, well-shaped argument under time pressure.',
    ceiling: 'Register slips in tasks with a specific audience, such as difficult situations.',
    lever: 'Name the listener and their stake before you start speaking.',
  },
  {
    level: 11,
    can: 'Handles nuance and pushback with natural pacing and precise word choice.',
    ceiling: 'Closing moves are sometimes cut off by the clock.',
    lever: 'Reserve the last ten seconds for a prepared closing sentence.',
  },
  {
    level: 12,
    can: 'Speaks with the fluency, precision and control of a proficient professional.',
    ceiling: 'Nothing systematic remains.',
    lever: 'Maintain with full 8-task sets; protect delivery on unfamiliar prompts.',
  },
];

export const LEVEL_DESCRIPTORS: Record<Skill, LevelDescriptor[]> = {
  reading,
  listening,
  writing,
  speaking,
};

export function descriptorFor(skill: Skill, level: number): LevelDescriptor {
  const table = LEVEL_DESCRIPTORS[skill];
  const clamped = Math.max(5, Math.min(12, Math.round(level)));
  return table.find((d) => d.level === clamped) ?? table[table.length - 1];
}

/** Level rounded the way the UI shows it, with an explicit uncertainty band. */
export function levelBand(level: number, se: number): { low: number; high: number; label: string } {
  const low = Math.max(MIN_LEVEL, Math.round((level - se) * 10) / 10);
  const high = Math.min(MAX_LEVEL, Math.round((level + se) * 10) / 10);
  const lowR = Math.max(MIN_LEVEL, Math.floor(low));
  const highR = Math.min(MAX_LEVEL, Math.ceil(high));
  return {
    low,
    high,
    label: lowR === highR ? `CLB ${lowR}` : `CLB ${lowR}–${highR}`,
  };
}

/** How much evidence stands behind an estimate — drives honest UI language. */
export function evidenceQuality(observations: number, se: number): {
  key: 'none' | 'provisional' | 'developing' | 'solid';
  label: string;
} {
  if (observations === 0) return { key: 'none', label: 'No evidence yet' };
  if (observations < 12 || se > 1.4) return { key: 'provisional', label: 'Provisional estimate' };
  if (observations < 40 || se > 0.8) return { key: 'developing', label: 'Firming up' };
  return { key: 'solid', label: 'Well evidenced' };
}

/**
 * Expected practice volume to move one level, by starting level. Higher bands
 * take disproportionately longer — this drives honest timeline projections
 * rather than motivational promises.
 */
export function hoursPerLevel(fromLevel: number): number {
  const table: Record<number, number> = {
    5: 22,
    6: 26,
    7: 32,
    8: 40,
    9: 52,
    10: 70,
    11: 95,
  };
  return table[Math.floor(fromLevel)] ?? 95;
}

export function projectedHours(from: number, to: number): number {
  let total = 0;
  for (let l = Math.floor(from); l < Math.ceil(to); l++) {
    const fraction = Math.min(1, Math.max(0, Math.min(to, l + 1) - Math.max(from, l)));
    total += hoursPerLevel(l) * fraction;
  }
  return Math.round(total);
}
