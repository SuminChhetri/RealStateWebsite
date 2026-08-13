/**
 * Meridian micro-skill taxonomy.
 *
 * This file is the product's spine. Every question, mistake, recommendation,
 * lesson and analytics view is keyed to a micro-skill slug defined here, which
 * is what lets the system say "you understand vocabulary but you over-read
 * inference questions" instead of "you scored 72%".
 *
 * Design rules:
 *  - Slugs are stable and namespaced (`skill.microskill`). Never renamed —
 *    a rename would orphan a learner's history.
 *  - Each micro-skill declares the CLB band where it starts to discriminate,
 *    so the item selector never wastes a CLB 11 learner's time on a
 *    micro-skill that stops separating levels at CLB 7.
 *  - `diagnosticWeight` is how strongly the micro-skill predicts overall skill
 *    level; used to build a short but informative diagnostic.
 */

export const SKILLS = ['reading', 'listening', 'writing', 'speaking'] as const;
export type Skill = (typeof SKILLS)[number];

export const ALL_DOMAINS = [...SKILLS, 'vocabulary', 'grammar'] as const;
export type Domain = (typeof ALL_DOMAINS)[number];

export interface MicroSkill {
  slug: string;
  skill: Domain;
  label: string;
  /** One sentence a learner can act on — shown in analytics and mistake bank. */
  description: string;
  /** What separates a strong performance from a weak one at the top bands. */
  discriminator: string;
  /** CLB band in which this micro-skill best discriminates ability. */
  band: [number, number];
  diagnosticWeight: number;
}

export interface PartType {
  slug: string;
  skill: Domain;
  label: string;
  /** Test-facing description of the task the learner is doing. */
  description: string;
  microSkills: string[];
  itemsPerSet: [number, number];
  /** Approximate seconds a well-prepared learner spends per item. */
  pacingSeconds: number;
}

/* ------------------------------------------------------------------ */
/* Reading                                                             */
/* ------------------------------------------------------------------ */

const readingMicroSkills: MicroSkill[] = [
  {
    slug: 'reading.literal_detail',
    skill: 'reading',
    label: 'Locating stated detail',
    description: 'Finding a fact that the text states directly, without paraphrase traps.',
    discriminator: 'Speed and accuracy when the answer is paraphrased rather than copied.',
    band: [5, 8],
    diagnosticWeight: 0.6,
  },
  {
    slug: 'reading.paraphrase',
    skill: 'reading',
    label: 'Recognising paraphrase',
    description: 'Matching an option to the text when the wording has been changed entirely.',
    discriminator: 'Resisting options that reuse the passage’s exact words but change the meaning.',
    band: [6, 10],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'reading.main_idea',
    skill: 'reading',
    label: 'Main idea and gist',
    description: 'Identifying what a paragraph or whole text is fundamentally about.',
    discriminator: 'Choosing the idea that covers the whole text, not one vivid part of it.',
    band: [6, 10],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'reading.inference',
    skill: 'reading',
    label: 'Inference',
    description: 'Drawing a conclusion the writer implies but never states.',
    discriminator: 'Staying inside what the text supports instead of adding world knowledge.',
    band: [7, 12],
    diagnosticWeight: 1.4,
  },
  {
    slug: 'reading.writer_purpose',
    skill: 'reading',
    label: 'Purpose and function',
    description: 'Explaining why a sentence, paragraph or whole text was written.',
    discriminator: 'Separating what a passage says from what it is doing rhetorically.',
    band: [8, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'reading.tone_attitude',
    skill: 'reading',
    label: 'Tone and stance',
    description: 'Reading how a writer feels about the subject through word choice.',
    discriminator: 'Detecting hedged, ironic or reluctant approval rather than plain praise.',
    band: [8, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'reading.cohesion',
    skill: 'reading',
    label: 'Cohesion and reference',
    description: 'Tracking what pronouns, connectors and demonstratives point back to.',
    discriminator: 'Holding long-distance reference chains across paragraphs.',
    band: [7, 11],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'reading.text_organisation',
    skill: 'reading',
    label: 'Text organisation',
    description: 'Understanding how a text is structured and where information belongs.',
    discriminator: 'Predicting where an idea would go before scanning for it.',
    band: [7, 11],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'reading.information_matching',
    skill: 'reading',
    label: 'Matching information to sources',
    description: 'Deciding which of several short texts contains a piece of information.',
    discriminator: 'Discriminating between sources that overlap heavily in topic.',
    band: [6, 10],
    diagnosticWeight: 0.8,
  },
  {
    slug: 'reading.gap_completion',
    skill: 'reading',
    label: 'Completing a text logically',
    description: 'Choosing the phrase that fits both the meaning and the grammar of a gap.',
    discriminator: 'Balancing local grammar against the paragraph’s argument.',
    band: [7, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'reading.vocabulary_in_context',
    skill: 'reading',
    label: 'Vocabulary in context',
    description: 'Working out what a word means from how it is used here.',
    discriminator: 'Handling common words used in a low-frequency sense.',
    band: [7, 12],
    diagnosticWeight: 1.1,
  },
  {
    slug: 'reading.scanning_speed',
    skill: 'reading',
    label: 'Scanning under time pressure',
    description: 'Finding a target quickly without reading everything.',
    discriminator: 'Maintaining accuracy when the clock is short.',
    band: [6, 11],
    diagnosticWeight: 0.7,
  },
];

const readingParts: PartType[] = [
  {
    slug: 'reading.correspondence',
    skill: 'reading',
    label: 'Reading Correspondence',
    description:
      'A personal or workplace message, followed by questions and a reply to complete.',
    microSkills: [
      'reading.literal_detail',
      'reading.paraphrase',
      'reading.inference',
      'reading.gap_completion',
      'reading.cohesion',
    ],
    itemsPerSet: [10, 11],
    pacingSeconds: 55,
  },
  {
    slug: 'reading.diagram',
    skill: 'reading',
    label: 'Reading to Apply a Diagram',
    description:
      'A chart, schedule or table paired with a message; you apply the visual to a real decision.',
    microSkills: [
      'reading.information_matching',
      'reading.literal_detail',
      'reading.inference',
      'reading.scanning_speed',
    ],
    itemsPerSet: [8, 9],
    pacingSeconds: 50,
  },
  {
    slug: 'reading.information',
    skill: 'reading',
    label: 'Reading for Information',
    description:
      'Several short paragraphs on one topic; statements must be matched to the right paragraph.',
    microSkills: [
      'reading.information_matching',
      'reading.main_idea',
      'reading.paraphrase',
      'reading.text_organisation',
    ],
    itemsPerSet: [9, 10],
    pacingSeconds: 55,
  },
  {
    slug: 'reading.viewpoints',
    skill: 'reading',
    label: 'Reading for Viewpoints',
    description:
      'An article expressing positions, plus a reader comment to complete; opinion and stance dominate.',
    microSkills: [
      'reading.inference',
      'reading.tone_attitude',
      'reading.writer_purpose',
      'reading.gap_completion',
      'reading.vocabulary_in_context',
    ],
    itemsPerSet: [9, 10],
    pacingSeconds: 65,
  },
];

/* ------------------------------------------------------------------ */
/* Listening                                                           */
/* ------------------------------------------------------------------ */

const listeningMicroSkills: MicroSkill[] = [
  {
    slug: 'listening.detail_recall',
    skill: 'listening',
    label: 'Holding detail',
    description: 'Keeping names, numbers, times and places accurate after one hearing.',
    discriminator: 'Retaining detail when two similar figures are mentioned close together.',
    band: [5, 9],
    diagnosticWeight: 0.8,
  },
  {
    slug: 'listening.gist',
    skill: 'listening',
    label: 'Gist and main point',
    description: 'Summarising what a speaker is fundamentally saying.',
    discriminator: 'Separating the speaker’s point from the example used to illustrate it.',
    band: [6, 10],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'listening.inference',
    skill: 'listening',
    label: 'Inference from speech',
    description: 'Concluding what is meant but not said.',
    discriminator: 'Reading intent behind indirect or polite phrasing.',
    band: [7, 12],
    diagnosticWeight: 1.4,
  },
  {
    slug: 'listening.speaker_attitude',
    skill: 'listening',
    label: 'Attitude and tone',
    description: 'Hearing certainty, hesitation, irritation or enthusiasm in how something is said.',
    discriminator: 'Distinguishing genuine agreement from polite disagreement.',
    band: [8, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'listening.speaker_relationship',
    skill: 'listening',
    label: 'Roles and relationships',
    description: 'Working out who the speakers are to each other and what each one wants.',
    discriminator: 'Tracking three or more voices with overlapping agendas.',
    band: [7, 11],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'listening.function',
    skill: 'listening',
    label: 'Function of an utterance',
    description: 'Naming what a speaker is doing: conceding, warning, correcting, softening.',
    discriminator: 'Identifying rhetorical moves rather than content words.',
    band: [8, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'listening.prediction',
    skill: 'listening',
    label: 'Predicting what follows',
    description: 'Anticipating the next step in a conversation or report.',
    discriminator: 'Using discourse signals rather than topic guessing.',
    band: [7, 11],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'listening.note_taking',
    skill: 'listening',
    label: 'Note-taking under load',
    description: 'Capturing structure while the audio keeps moving.',
    discriminator: 'Writing less and remembering more; noting relationships, not words.',
    band: [7, 12],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'listening.distractor_resistance',
    skill: 'listening',
    label: 'Resisting corrections and distractors',
    description: 'Following information that a speaker revises mid-sentence.',
    discriminator: 'Catching self-corrections such as “actually, make that Thursday”.',
    band: [6, 11],
    diagnosticWeight: 1.1,
  },
  {
    slug: 'listening.discourse_markers',
    skill: 'listening',
    label: 'Following discourse signals',
    description: 'Using signals like “that said” or “to be fair” to track the argument.',
    discriminator: 'Hearing a concession and knowing the real point is coming next.',
    band: [8, 12],
    diagnosticWeight: 1.2,
  },
];

const listeningParts: PartType[] = [
  {
    slug: 'listening.problem_solving',
    skill: 'listening',
    label: 'Listening to Problem Solving',
    description: 'A conversation in which two people work through a practical problem.',
    microSkills: [
      'listening.detail_recall',
      'listening.distractor_resistance',
      'listening.speaker_relationship',
      'listening.inference',
    ],
    itemsPerSet: [7, 8],
    pacingSeconds: 30,
  },
  {
    slug: 'listening.daily_life',
    skill: 'listening',
    label: 'Listening to a Daily Life Conversation',
    description: 'An everyday exchange between people who know each other.',
    microSkills: ['listening.gist', 'listening.detail_recall', 'listening.speaker_attitude'],
    itemsPerSet: [5, 6],
    pacingSeconds: 30,
  },
  {
    slug: 'listening.information',
    skill: 'listening',
    label: 'Listening for Information',
    description: 'A dense informational exchange — instructions, arrangements, procedures.',
    microSkills: ['listening.detail_recall', 'listening.note_taking', 'listening.prediction'],
    itemsPerSet: [5, 6],
    pacingSeconds: 30,
  },
  {
    slug: 'listening.news',
    skill: 'listening',
    label: 'Listening to a News Item',
    description: 'A short broadcast report with cause, consequence and attribution.',
    microSkills: ['listening.gist', 'listening.function', 'listening.inference'],
    itemsPerSet: [5, 5],
    pacingSeconds: 30,
  },
  {
    slug: 'listening.discussion',
    skill: 'listening',
    label: 'Listening to a Discussion',
    description: 'Three speakers with different priorities negotiating a decision.',
    microSkills: [
      'listening.speaker_relationship',
      'listening.speaker_attitude',
      'listening.inference',
      'listening.discourse_markers',
    ],
    itemsPerSet: [8, 8],
    pacingSeconds: 35,
  },
  {
    slug: 'listening.viewpoints',
    skill: 'listening',
    label: 'Listening to Viewpoints',
    description: 'An extended monologue or interview presenting a position and its limits.',
    microSkills: [
      'listening.inference',
      'listening.function',
      'listening.discourse_markers',
      'listening.speaker_attitude',
    ],
    itemsPerSet: [6, 6],
    pacingSeconds: 35,
  },
];

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

const writingMicroSkills: MicroSkill[] = [
  {
    slug: 'writing.task_fulfilment',
    skill: 'writing',
    label: 'Task fulfilment',
    description: 'Covering every element the prompt asks for, with the right purpose.',
    discriminator: 'Addressing all bullets fully rather than mentioning them in passing.',
    band: [5, 12],
    diagnosticWeight: 1.5,
  },
  {
    slug: 'writing.development',
    skill: 'writing',
    label: 'Development of ideas',
    description: 'Supporting each point with reasons, examples and consequences.',
    discriminator: 'Two to three sentences of genuine support per point, not one assertion.',
    band: [7, 12],
    diagnosticWeight: 1.5,
  },
  {
    slug: 'writing.organisation',
    skill: 'writing',
    label: 'Organisation',
    description: 'Arranging the response so a reader always knows where they are.',
    discriminator: 'Purposeful paragraphing with a visible opening move and closing move.',
    band: [6, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'writing.coherence',
    skill: 'writing',
    label: 'Coherence and cohesion',
    description: 'Linking sentences so each one follows naturally from the last.',
    discriminator: 'Cohesion through reference and information flow, not connector spam.',
    band: [7, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'writing.register',
    skill: 'writing',
    label: 'Register and tone',
    description: 'Matching formality to the reader and the situation.',
    discriminator: 'Sustained register with no contraction/idiom slips in a formal message.',
    band: [7, 12],
    diagnosticWeight: 1.1,
  },
  {
    slug: 'writing.lexical_range',
    skill: 'writing',
    label: 'Vocabulary range and precision',
    description: 'Choosing exact words and natural collocations rather than approximations.',
    discriminator: 'Precision under pressure; low repetition of high-frequency verbs.',
    band: [7, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'writing.grammar_accuracy',
    skill: 'writing',
    label: 'Grammatical accuracy',
    description: 'Producing sentences free of errors that distract or obscure meaning.',
    discriminator: 'Accuracy is maintained in the complex sentences, not only the simple ones.',
    band: [6, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'writing.sentence_variety',
    skill: 'writing',
    label: 'Sentence variety',
    description: 'Mixing sentence lengths and structures for readability and emphasis.',
    discriminator: 'Subordination and fronting used deliberately, not accidentally.',
    band: [8, 12],
    diagnosticWeight: 1.1,
  },
  {
    slug: 'writing.concision',
    skill: 'writing',
    label: 'Concision',
    description: 'Saying it once, clearly, without padding.',
    discriminator: 'No filler openings, no restated prompt, no empty intensifiers.',
    band: [8, 12],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'writing.exam_pacing',
    skill: 'writing',
    label: 'Pacing under exam conditions',
    description: 'Planning, drafting and checking inside the time limit.',
    discriminator: 'Finishing with time to proofread instead of stopping mid-argument.',
    band: [6, 12],
    diagnosticWeight: 0.8,
  },
];

const writingParts: PartType[] = [
  {
    slug: 'writing.email',
    skill: 'writing',
    label: 'Writing an Email',
    description:
      'A situation requiring a written message with a clear purpose and required content points.',
    microSkills: [
      'writing.task_fulfilment',
      'writing.register',
      'writing.organisation',
      'writing.grammar_accuracy',
      'writing.lexical_range',
    ],
    itemsPerSet: [1, 1],
    pacingSeconds: 1620,
  },
  {
    slug: 'writing.survey',
    skill: 'writing',
    label: 'Responding to Survey Questions',
    description:
      'A choice between two options with a written argument justifying the one you pick.',
    microSkills: [
      'writing.task_fulfilment',
      'writing.development',
      'writing.coherence',
      'writing.sentence_variety',
      'writing.concision',
    ],
    itemsPerSet: [1, 1],
    pacingSeconds: 1560,
  },
];

/* ------------------------------------------------------------------ */
/* Speaking                                                            */
/* ------------------------------------------------------------------ */

const speakingMicroSkills: MicroSkill[] = [
  {
    slug: 'speaking.task_response',
    skill: 'speaking',
    label: 'Answering the actual question',
    description: 'Doing the communicative job the task asks for, not a nearby one.',
    discriminator: 'The first ten seconds already commit to the required move.',
    band: [5, 12],
    diagnosticWeight: 1.5,
  },
  {
    slug: 'speaking.structure',
    skill: 'speaking',
    label: 'Structure of the response',
    description: 'Opening, body and closing that a listener can follow without effort.',
    discriminator: 'Signposting that shows the shape of the answer while it unfolds.',
    band: [6, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'speaking.development',
    skill: 'speaking',
    label: 'Depth of support',
    description: 'Backing each claim with a reason, an example and a consequence.',
    discriminator: 'Specific, concrete detail rather than general statements.',
    band: [7, 12],
    diagnosticWeight: 1.5,
  },
  {
    slug: 'speaking.fluency',
    skill: 'speaking',
    label: 'Fluency and flow',
    description: 'Speaking continuously with pauses that fall at meaningful boundaries.',
    discriminator: 'Hesitation appears between ideas, not inside phrases.',
    band: [6, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'speaking.pacing',
    skill: 'speaking',
    label: 'Pacing and time use',
    description: 'Filling the response window without rushing or running dry.',
    discriminator: 'Finishing a complete thought as time ends.',
    band: [6, 11],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'speaking.lexical_range',
    skill: 'speaking',
    label: 'Vocabulary range',
    description: 'Reaching for precise words under real-time pressure.',
    discriminator: 'Topic-specific vocabulary produced spontaneously.',
    band: [7, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'speaking.grammar_control',
    skill: 'speaking',
    label: 'Grammatical control',
    description: 'Keeping structures accurate while speaking spontaneously.',
    discriminator: 'Complex structures attempted and controlled, not avoided.',
    band: [7, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'speaking.coherence',
    skill: 'speaking',
    label: 'Coherence',
    description: 'Connecting ideas so the listener never has to reconstruct the logic.',
    discriminator: 'Clear referencing and transitions without repetitive connectors.',
    band: [7, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'speaking.filler_control',
    skill: 'speaking',
    label: 'Filler and repetition control',
    description: 'Avoiding “um”, “like” and restarted sentences that dilute the message.',
    discriminator: 'Silent thinking pauses instead of vocalised ones.',
    band: [6, 11],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'speaking.register',
    skill: 'speaking',
    label: 'Register and audience',
    description: 'Adjusting formality to the person you are addressing in the scenario.',
    discriminator: 'Politeness strategies suited to the relationship described.',
    band: [7, 12],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'speaking.intelligibility',
    skill: 'speaking',
    label: 'Intelligibility',
    description: 'Being understood easily: stress, rhythm and clarity of delivery.',
    discriminator: 'Word and sentence stress that supports meaning.',
    band: [5, 11],
    diagnosticWeight: 1.1,
  },
];

const speakingParts: PartType[] = [
  {
    slug: 'speaking.t1_advice',
    skill: 'speaking',
    label: 'Task 1 · Giving Advice',
    description: 'Advise a named person on a decision, with reasons they can act on.',
    microSkills: ['speaking.task_response', 'speaking.structure', 'speaking.development'],
    itemsPerSet: [1, 1],
    pacingSeconds: 90,
  },
  {
    slug: 'speaking.t2_experience',
    skill: 'speaking',
    label: 'Task 2 · Talking about a Personal Experience',
    description: 'Narrate a specific past experience with context, events and significance.',
    microSkills: ['speaking.development', 'speaking.coherence', 'speaking.grammar_control'],
    itemsPerSet: [1, 1],
    pacingSeconds: 60,
  },
  {
    slug: 'speaking.t3_scene',
    skill: 'speaking',
    label: 'Task 3 · Describing a Scene',
    description: 'Describe an image for someone who cannot see it, in a usable order.',
    microSkills: ['speaking.structure', 'speaking.lexical_range', 'speaking.pacing'],
    itemsPerSet: [1, 1],
    pacingSeconds: 60,
  },
  {
    slug: 'speaking.t4_predictions',
    skill: 'speaking',
    label: 'Task 4 · Making Predictions',
    description: 'Predict what happens next in the scene and justify each prediction.',
    microSkills: ['speaking.development', 'speaking.grammar_control', 'speaking.coherence'],
    itemsPerSet: [1, 1],
    pacingSeconds: 60,
  },
  {
    slug: 'speaking.t5_persuade',
    skill: 'speaking',
    label: 'Task 5 · Comparing and Persuading',
    description: 'Choose between two options and persuade a specific listener.',
    microSkills: ['speaking.task_response', 'speaking.development', 'speaking.register'],
    itemsPerSet: [1, 1],
    pacingSeconds: 60,
  },
  {
    slug: 'speaking.t6_difficult',
    skill: 'speaking',
    label: 'Task 6 · Dealing with a Difficult Situation',
    description: 'Handle an awkward interpersonal situation by choosing who to speak to and how.',
    microSkills: ['speaking.register', 'speaking.task_response', 'speaking.coherence'],
    itemsPerSet: [1, 1],
    pacingSeconds: 60,
  },
  {
    slug: 'speaking.t7_opinion',
    skill: 'speaking',
    label: 'Task 7 · Expressing Opinions',
    description: 'State a position on a public question and defend it against the obvious objection.',
    microSkills: ['speaking.development', 'speaking.structure', 'speaking.lexical_range'],
    itemsPerSet: [1, 1],
    pacingSeconds: 90,
  },
  {
    slug: 'speaking.t8_unusual',
    skill: 'speaking',
    label: 'Task 8 · Describing an Unusual Situation',
    description: 'Describe an unfamiliar object or scene precisely enough for someone to picture it.',
    microSkills: ['speaking.lexical_range', 'speaking.structure', 'speaking.intelligibility'],
    itemsPerSet: [1, 1],
    pacingSeconds: 60,
  },
];

/* ------------------------------------------------------------------ */
/* Vocabulary & grammar                                                */
/* ------------------------------------------------------------------ */

const supportMicroSkills: MicroSkill[] = [
  {
    slug: 'vocabulary.precision',
    skill: 'vocabulary',
    label: 'Word choice precision',
    description: 'Selecting the word that means exactly what you intend.',
    discriminator: 'Distinguishing near-synonyms by connotation and strength.',
    band: [7, 12],
    diagnosticWeight: 1.1,
  },
  {
    slug: 'vocabulary.collocation',
    skill: 'vocabulary',
    label: 'Collocation',
    description: 'Combining words the way fluent speakers actually combine them.',
    discriminator: 'Natural verb–noun and adjective–noun pairings.',
    band: [7, 12],
    diagnosticWeight: 1.2,
  },
  {
    slug: 'vocabulary.register_fit',
    skill: 'vocabulary',
    label: 'Register fit',
    description: 'Knowing which words belong in formal versus casual contexts.',
    discriminator: 'No casual intensifiers in professional writing.',
    band: [7, 12],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'grammar.verb_forms',
    skill: 'grammar',
    label: 'Verb forms and tense',
    description: 'Using the tense and aspect the meaning requires.',
    discriminator: 'Perfect and conditional forms controlled in extended writing.',
    band: [6, 11],
    diagnosticWeight: 1.1,
  },
  {
    slug: 'grammar.articles',
    skill: 'grammar',
    label: 'Articles and determiners',
    description: 'Signalling whether a noun is known, new, general or specific.',
    discriminator: 'Consistent article use with abstract and plural nouns.',
    band: [6, 11],
    diagnosticWeight: 1.0,
  },
  {
    slug: 'grammar.clause_structure',
    skill: 'grammar',
    label: 'Clause structure',
    description: 'Building complex sentences that stay grammatical throughout.',
    discriminator: 'Relative and subordinate clauses without run-ons or fragments.',
    band: [7, 12],
    diagnosticWeight: 1.3,
  },
  {
    slug: 'grammar.prepositions',
    skill: 'grammar',
    label: 'Prepositions',
    description: 'Using the preposition that the verb, noun or adjective demands.',
    discriminator: 'Dependent prepositions in less common patterns.',
    band: [6, 11],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'grammar.agreement',
    skill: 'grammar',
    label: 'Agreement',
    description: 'Matching subjects with verbs and pronouns with their referents.',
    discriminator: 'Agreement held across long, interrupted subjects.',
    band: [5, 10],
    diagnosticWeight: 0.9,
  },
  {
    slug: 'grammar.word_order',
    skill: 'grammar',
    label: 'Word order',
    description: 'Placing adverbs, questions and modifiers where English expects them.',
    discriminator: 'Embedded questions and fronted adverbials handled correctly.',
    band: [6, 11],
    diagnosticWeight: 0.9,
  },
];

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export const MICRO_SKILLS: MicroSkill[] = [
  ...readingMicroSkills,
  ...listeningMicroSkills,
  ...writingMicroSkills,
  ...speakingMicroSkills,
  ...supportMicroSkills,
];

export const PART_TYPES: PartType[] = [
  ...readingParts,
  ...listeningParts,
  ...writingParts,
  ...speakingParts,
];

const microBySlug = new Map(MICRO_SKILLS.map((m) => [m.slug, m]));
const partBySlug = new Map(PART_TYPES.map((p) => [p.slug, p]));

export function microSkill(slug: string): MicroSkill {
  const found = microBySlug.get(slug);
  if (!found) throw new Error(`Unknown micro-skill: ${slug}`);
  return found;
}

export function tryMicroSkill(slug: string): MicroSkill | undefined {
  return microBySlug.get(slug);
}

export function partType(slug: string): PartType {
  const found = partBySlug.get(slug);
  if (!found) throw new Error(`Unknown part type: ${slug}`);
  return found;
}

export function microSkillsFor(skill: Domain): MicroSkill[] {
  return MICRO_SKILLS.filter((m) => m.skill === skill);
}

export function partsFor(skill: Domain): PartType[] {
  return PART_TYPES.filter((p) => p.skill === skill);
}

export const SKILL_LABELS: Record<Domain, string> = {
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
};

/** Ordered section flow used by the mock-test runner. */
export const TEST_SECTION_ORDER: Skill[] = ['listening', 'reading', 'writing', 'speaking'];

/** Published section shape used to build full simulations and section drills. */
export const SECTION_BLUEPRINT: Record<
  Skill,
  { parts: string[]; minutes: number; itemCount: number }
> = {
  listening: {
    parts: [
      'listening.problem_solving',
      'listening.daily_life',
      'listening.information',
      'listening.news',
      'listening.discussion',
      'listening.viewpoints',
    ],
    minutes: 50,
    itemCount: 38,
  },
  reading: {
    parts: [
      'reading.correspondence',
      'reading.diagram',
      'reading.information',
      'reading.viewpoints',
    ],
    minutes: 55,
    itemCount: 38,
  },
  writing: { parts: ['writing.email', 'writing.survey'], minutes: 53, itemCount: 2 },
  speaking: {
    parts: [
      'speaking.t1_advice',
      'speaking.t2_experience',
      'speaking.t3_scene',
      'speaking.t4_predictions',
      'speaking.t5_persuade',
      'speaking.t6_difficult',
      'speaking.t7_opinion',
      'speaking.t8_unusual',
    ],
    minutes: 20,
    itemCount: 8,
  },
};
