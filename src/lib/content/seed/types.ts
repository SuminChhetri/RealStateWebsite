/**
 * Authoring types for Meridian's content corpus.
 *
 * All content in this repository is original, written for this product. It is
 * informed by the publicly documented shape of the CELPIP-General test — the
 * task types, response formats and timings that the test publisher describes
 * openly — and by general practice in language assessment design. No passage,
 * item, script or explanation is reproduced from a published question bank,
 * course, or any other copyrighted source.
 *
 * Item-writing standards applied throughout:
 *  - One defensible key. Every distractor is wrong for a stated reason, and
 *    the reason is recorded in `rationale` so the feedback can name it.
 *  - Distractors model real learner errors — over-literal reading, plausible
 *    world knowledge, correct-but-not-asked, right-idea-wrong-scope — rather
 *    than being obviously absent from the text.
 *  - No item is answerable without the stimulus.
 *  - Explanations teach the transferable move, not just the answer.
 */

export interface SeedOption {
  key: string;
  text: string;
  /** Why a learner picks this. For the key, why it is right. */
  rationale: string;
}

export interface SeedQuestion {
  slug: string;
  microSkill: string;
  format?: 'mcq' | 'blank_choice' | 'multi_select';
  prompt: string;
  options: SeedOption[];
  answerKey: string;
  explanation: string;
  takeaway?: string;
  level: number;
  /** Calibrated difficulty on the CLB scale. Usually within ±1 of `level`. */
  difficulty: number;
  targetSeconds?: number;
}

export interface SeedStimulus {
  slug: string;
  skill: 'reading' | 'listening';
  partType: string;
  title: string;
  body?: string;
  script?: { speaker: string; voice: 'narrator' | 'speaker_a' | 'speaker_b' | 'speaker_c' | 'reporter'; text: string }[];
  figure?: {
    kind: 'table' | 'schedule' | 'chart';
    caption: string;
    columns: string[];
    rows: string[][];
    note?: string;
  };
  level: number;
  topic: string;
  questions: SeedQuestion[];
}

export interface SeedWritingTask {
  slug: string;
  taskType: 'writing.email' | 'writing.survey';
  title: string;
  scenario: string;
  instructions: string;
  requirements: string[];
  choices?: string[];
  minWords: number;
  maxWords: number;
  timeLimitSeconds: number;
  register: 'formal' | 'semi_formal' | 'informal';
  level: number;
  topic: string;
  modelNotes: string;
}

export interface SeedSpeakingTask {
  slug: string;
  taskType: string;
  taskNumber: number;
  title: string;
  prompt: string;
  context?: { lines?: string[]; scene?: string; options?: string[] };
  prepSeconds: number;
  speakSeconds: number;
  level: number;
  topic: string;
  successCriteria: string[];
  modelNotes: string;
}

export type LessonBlock =
  | { type: 'prose'; heading?: string; text: string }
  | { type: 'principle'; text: string }
  | { type: 'example'; label: string; weak: string; strong: string; why: string }
  | { type: 'compare'; heading: string; rows: { left: string; right: string }[]; leftLabel: string; rightLabel: string }
  | { type: 'checkpoint'; question: string; options: { text: string; correct: boolean; feedback: string }[] }
  | { type: 'drill'; instruction: string; items: { prompt: string; answer: string; note?: string }[] }
  | { type: 'callout'; tone: 'insight' | 'warning'; text: string };

export interface SeedLesson {
  slug: string;
  title: string;
  summary: string;
  skill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' | 'grammar' | 'strategy';
  microSkills: string[];
  level: number;
  minutes: number;
  blocks: LessonBlock[];
}

export interface SeedVocabulary {
  headword: string;
  pos: string;
  definition: string;
  example: string;
  collocations: string[];
  register: 'neutral' | 'formal' | 'informal' | 'academic';
  level: number;
  usefulFor: string[];
  pitfall?: string;
  topic: string;
}

export interface SeedGrammarPoint {
  slug: string;
  title: string;
  errorCode: string;
  explanation: string;
  contrasts: { wrong: string; right: string; why: string }[];
  level: number;
  drills: { prompt: string; answer: string; alternatives?: string[]; explanation: string }[];
}
