/**
 * Meridian relational schema.
 *
 * Dialect: PostgreSQL, hosted on Supabase. The application connects as a
 * normal Postgres role over the connection pooler and enforces tenancy in
 * `lib/auth/guard.ts`; it does not use Supabase Auth or PostgREST.
 *
 * Because a Supabase project also exposes these tables through PostgREST using
 * a publishable anon key, every table is additionally locked down with
 * row-level security and no permissive policy (see the RLS migration). The
 * server's own role bypasses RLS, so the application is unaffected, while a
 * leaked anon key reaches nothing.
 *
 * Conventions:
 *  - `orgId` on every tenant-scoped row. Authorization is enforced in
 *    `lib/auth/guard.ts`; the client never supplies a tenant id.
 *  - Timestamps are unix seconds (integer) for cheap range scans.
 *  - Structured payloads are stored as JSON text and parsed through zod at
 *    the repository boundary, never trusted raw.
 *  - Taxonomy (skills, micro-skills, question types) lives in versioned code
 *    under `lib/content/taxonomy.ts` and is referenced here by stable slug.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * Timestamps are unix seconds rather than `timestamptz`. Every engine in this
 * product reasons in unix seconds — scheduler intervals, decay windows, streak
 * arithmetic — so storing them natively keeps one representation end to end and
 * avoids a conversion at every boundary.
 */
const now = sql`(extract(epoch from now())::int)`;

/* ------------------------------------------------------------------ */
/* Tenancy & identity                                                  */
/* ------------------------------------------------------------------ */

export const organizations = pgTable(
  'organizations',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    /** 'personal' orgs are auto-created for individual learners. */
    kind: text('kind', { enum: ['personal', 'school', 'enterprise'] })
      .notNull()
      .default('personal'),
    /** Entitlement tier resolved by the billing abstraction (no provider wired). */
    planKey: text('plan_key').notNull().default('learner_free'),
    seatLimit: integer('seat_limit').notNull().default(1),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [uniqueIndex('organizations_slug_idx').on(t.slug)],
);

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    /** scrypt: `scrypt$N$r$p$salt$hash` — see lib/auth/password.ts */
    passwordHash: text('password_hash').notNull(),
    locale: text('locale').notNull().default('en-CA'),
    timezone: text('timezone').notNull().default('America/Toronto'),
    createdAt: integer('created_at').notNull().default(now),
    lastSeenAt: integer('last_seen_at'),
  },
  (t) => [uniqueIndex('users_email_idx').on(t.email)],
);

export const memberships = pgTable(
  'memberships',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'admin', 'teacher', 'learner', 'reviewer'] })
      .notNull()
      .default('learner'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('memberships_user_org_idx').on(t.userId, t.orgId),
    index('memberships_org_idx').on(t.orgId, t.role),
  ],
);

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: text('id').primaryKey(), // sha256 of the cookie token; the raw token is never stored
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activeOrgId: text('active_org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
    createdAt: integer('created_at').notNull().default(now),
    userAgentHash: text('user_agent_hash'),
  },
  (t) => [index('auth_sessions_user_idx').on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Learner profile                                                     */
/* ------------------------------------------------------------------ */

export const learnerProfiles = pgTable(
  'learner_profiles',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    targetLevel: integer('target_level').notNull().default(12),
    /** ISO date (YYYY-MM-DD); null when the learner has not booked a test. */
    examDate: text('exam_date'),
    minutesPerDay: integer('minutes_per_day').notNull().default(45),
    daysPerWeek: integer('days_per_week').notNull().default(5),
    priorAttempts: integer('prior_attempts').notNull().default(0),
    /** Self-reported 1–5 confidence per skill, JSON: {reading,listening,writing,speaking} */
    confidence: text('confidence').notNull().default('{}'),
    goalContext: text('goal_context', {
      enum: ['immigration', 'citizenship', 'professional', 'academic', 'personal'],
    })
      .notNull()
      .default('immigration'),
    onboardedAt: integer('onboarded_at'),
    diagnosticAttemptId: text('diagnostic_attempt_id'),
    createdAt: integer('created_at').notNull().default(now),
    updatedAt: integer('updated_at').notNull().default(now),
  },
  (t) => [uniqueIndex('learner_profiles_user_org_idx').on(t.userId, t.orgId)],
);

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

/** Reading passages and listening scripts share one stimulus table. */
export const stimuli = pgTable(
  'stimuli',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    skill: text('skill', { enum: ['reading', 'listening'] }).notNull(),
    /** Taxonomy slug, e.g. `reading.correspondence` / `listening.viewpoints`. */
    partType: text('part_type').notNull(),
    title: text('title').notNull(),
    /** Reading: markdown-ish body. Listening: null (see `script`). */
    body: text('body'),
    /** Listening: JSON array of {speaker, voice, text} turns for TTS + transcript. */
    script: text('script'),
    /** Optional JSON diagram/table description used by Reading Part 2 style items. */
    figure: text('figure'),
    /** Estimated CLB level the stimulus is calibrated for. */
    level: integer('level').notNull(),
    wordCount: integer('word_count').notNull().default(0),
    /** Flesch-Kincaid grade computed at seed time; surfaced in the content console. */
    readability: doublePrecision('readability'),
    topic: text('topic').notNull().default('general'),
    /**
     * How this stimulus came to exist. `authored` is hand-written and reviewed;
     * `generated` is composed by `lib/content/generate` from structured data.
     * Recorded rather than hidden: a learner is told which they are looking at,
     * and calibration treats them differently.
     */
    origin: text('origin', { enum: ['authored', 'generated'] })
      .notNull()
      .default('authored'),
    /** For generated rows, the seed that reproduces this exactly. */
    generatorSeed: text('generator_seed'),
    status: text('status', {
      enum: ['draft', 'in_review', 'approved', 'published', 'retired'],
    })
      .notNull()
      .default('published'),
    version: integer('version').notNull().default(1),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('stimuli_slug_idx').on(t.slug),
    index('stimuli_skill_level_idx').on(t.skill, t.level, t.status),
  ],
);

export const questions = pgTable(
  'questions',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    stimulusId: text('stimulus_id').references(() => stimuli.id, { onDelete: 'cascade' }),
    skill: text('skill', { enum: ['reading', 'listening', 'vocabulary', 'grammar'] }).notNull(),
    partType: text('part_type').notNull(),
    /** Micro-skill slug from the taxonomy — the unit of diagnosis. */
    microSkill: text('micro_skill').notNull(),
    format: text('format', {
      enum: ['mcq', 'blank_choice', 'multi_select', 'ordering'],
    })
      .notNull()
      .default('mcq'),
    prompt: text('prompt').notNull(),
    /** JSON: [{key,text,rationale}] — rationale explains why a distractor attracts. */
    options: text('options').notNull(),
    answerKey: text('answer_key').notNull(),
    explanation: text('explanation').notNull(),
    /** What a learner should take away beyond this single item. */
    takeaway: text('takeaway'),
    level: integer('level').notNull(),
    /** Seeded difficulty in logits; updated by item analytics once data exists. */
    difficulty: doublePrecision('difficulty').notNull().default(0),
    discrimination: doublePrecision('discrimination'),
    targetSeconds: integer('target_seconds').notNull().default(60),
    orderInSet: integer('order_in_set').notNull().default(0),
    /** See `stimuli.origin`. Surfaced to the learner on every generated item. */
    origin: text('origin', { enum: ['authored', 'generated'] })
      .notNull()
      .default('authored'),
    generatorSeed: text('generator_seed'),
    status: text('status', {
      enum: ['draft', 'in_review', 'approved', 'published', 'retired'],
    })
      .notNull()
      .default('published'),
    version: integer('version').notNull().default(1),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('questions_slug_idx').on(t.slug),
    index('questions_stimulus_idx').on(t.stimulusId, t.orderInSet),
    index('questions_skill_micro_idx').on(t.skill, t.microSkill, t.level, t.status),
  ],
);

export const writingTasks = pgTable(
  'writing_tasks',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    /** `writing.email` (Task 1) or `writing.survey` (Task 2). */
    taskType: text('task_type').notNull(),
    title: text('title').notNull(),
    scenario: text('scenario').notNull(),
    instructions: text('instructions').notNull(),
    /** JSON string[] of bullet requirements the response must cover. */
    requirements: text('requirements').notNull(),
    /** JSON string[] of options for survey-response tasks. */
    choices: text('choices'),
    minWords: integer('min_words').notNull().default(150),
    maxWords: integer('max_words').notNull().default(200),
    timeLimitSeconds: integer('time_limit_seconds').notNull().default(1620),
    register: text('register', { enum: ['formal', 'semi_formal', 'informal'] })
      .notNull()
      .default('semi_formal'),
    level: integer('level').notNull().default(9),
    topic: text('topic').notNull().default('general'),
    /** Teaching notes shown after submission: what a strong response does. */
    modelNotes: text('model_notes').notNull(),
    /** See `stimuli.origin`. Generated prompts are marked wherever they appear. */
    origin: text('origin', { enum: ['authored', 'generated'] })
      .notNull()
      .default('authored'),
    generatorSeed: text('generator_seed'),
    status: text('status', {
      enum: ['draft', 'in_review', 'approved', 'published', 'retired'],
    })
      .notNull()
      .default('published'),
    version: integer('version').notNull().default(1),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [uniqueIndex('writing_tasks_slug_idx').on(t.slug)],
);

export const speakingTasks = pgTable(
  'speaking_tasks',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    /** `speaking.t1_advice` … `speaking.t8_unusual` */
    taskType: text('task_type').notNull(),
    taskNumber: integer('task_number').notNull(),
    title: text('title').notNull(),
    prompt: text('prompt').notNull(),
    /** JSON: extra context lines, or scene description for Task 3/8. */
    context: text('context'),
    prepSeconds: integer('prep_seconds').notNull().default(30),
    speakSeconds: integer('speak_seconds').notNull().default(60),
    level: integer('level').notNull().default(9),
    topic: text('topic').notNull().default('general'),
    /** JSON string[]: the moves a high-level response makes, in order. */
    successCriteria: text('success_criteria').notNull(),
    modelNotes: text('model_notes').notNull(),
    /** See `stimuli.origin`. Generated prompts are marked wherever they appear. */
    origin: text('origin', { enum: ['authored', 'generated'] })
      .notNull()
      .default('authored'),
    generatorSeed: text('generator_seed'),
    status: text('status', {
      enum: ['draft', 'in_review', 'approved', 'published', 'retired'],
    })
      .notNull()
      .default('published'),
    version: integer('version').notNull().default(1),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('speaking_tasks_slug_idx').on(t.slug),
    index('speaking_tasks_number_idx').on(t.taskNumber, t.status),
  ],
);

export const lessons = pgTable(
  'lessons',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    skill: text('skill', {
      enum: ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar', 'strategy'],
    }).notNull(),
    /** Micro-skills this lesson remediates — drives "prescribed lesson" links. */
    microSkills: text('micro_skills').notNull().default('[]'),
    level: integer('level').notNull().default(9),
    minutes: integer('minutes').notNull().default(8),
    /** JSON array of lesson blocks (prose, example, compare, checkpoint, drill). */
    blocks: text('blocks').notNull(),
    status: text('status', {
      enum: ['draft', 'in_review', 'approved', 'published', 'retired'],
    })
      .notNull()
      .default('published'),
    version: integer('version').notNull().default(1),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('lessons_slug_idx').on(t.slug),
    index('lessons_skill_idx').on(t.skill, t.level, t.status),
  ],
);

export const vocabularyEntries = pgTable(
  'vocabulary_entries',
  {
    id: text('id').primaryKey(),
    headword: text('headword').notNull(),
    pos: text('pos').notNull(),
    definition: text('definition').notNull(),
    example: text('example').notNull(),
    /** JSON string[] — near-synonyms with register notes. */
    collocations: text('collocations').notNull().default('[]'),
    register: text('register', { enum: ['neutral', 'formal', 'informal', 'academic'] })
      .notNull()
      .default('neutral'),
    /** Band the word becomes useful at; drives level-appropriate introduction. */
    level: integer('level').notNull().default(9),
    /** Where the word earns points: e.g. `writing.survey`, `speaking.t5_persuade`. */
    usefulFor: text('useful_for').notNull().default('[]'),
    /** Common learner error with this word, if any. */
    pitfall: text('pitfall'),
    topic: text('topic').notNull().default('general'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('vocabulary_headword_idx').on(t.headword, t.pos),
    index('vocabulary_level_idx').on(t.level, t.topic),
  ],
);

export const grammarPoints = pgTable(
  'grammar_points',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    /** Error category emitted by the writing/speaking analysers. */
    errorCode: text('error_code').notNull(),
    explanation: text('explanation').notNull(),
    /** JSON [{wrong, right, why}] */
    contrasts: text('contrasts').notNull(),
    level: integer('level').notNull().default(8),
    /** JSON [{prompt, answer, alternatives, explanation}] — used for drills. */
    drills: text('drills').notNull().default('[]'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('grammar_points_slug_idx').on(t.slug),
    index('grammar_points_error_idx').on(t.errorCode),
  ],
);

/* ------------------------------------------------------------------ */
/* Content governance                                                  */
/* ------------------------------------------------------------------ */

export const contentVersions = pgTable(
  'content_versions',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    version: integer('version').notNull(),
    /** Full JSON snapshot so in-flight attempts can pin the exact wording. */
    snapshot: text('snapshot').notNull(),
    changedBy: text('changed_by'),
    changeReason: text('change_reason').notNull().default('seed'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('content_versions_entity_idx').on(t.entityType, t.entityId, t.version),
    index('content_versions_lookup_idx').on(t.entityType, t.entityId),
  ],
);

export const contentReviews = pgTable(
  'content_reviews',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    stage: text('stage', {
      enum: ['authored', 'automated_checks', 'expert_review', 'approved', 'published', 'flagged'],
    }).notNull(),
    /** JSON: [{check, severity, message}] from the automated validator. */
    findings: text('findings').notNull().default('[]'),
    reviewerId: text('reviewer_id'),
    note: text('note'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [index('content_reviews_entity_idx').on(t.entityType, t.entityId, t.stage)],
);

/** Aggregated psychometrics per item; recomputed from attempt data. */
export const itemStats = pgTable(
  'item_stats',
  {
    questionId: text('question_id')
      .primaryKey()
      .references(() => questions.id, { onDelete: 'cascade' }),
    exposures: integer('exposures').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    /** p-value (proportion correct). */
    pValue: doublePrecision('p_value'),
    /** Point-biserial correlation with total score. */
    discrimination: doublePrecision('discrimination'),
    medianSeconds: doublePrecision('median_seconds'),
    /** JSON {optionKey: count} for distractor analysis. */
    optionCounts: text('option_counts').notNull().default('{}'),
    flagged: boolean('flagged').notNull().default(false),
    flagReason: text('flag_reason'),
    updatedAt: integer('updated_at').notNull().default(now),
  },
);

/* ------------------------------------------------------------------ */
/* Practice & assessment                                               */
/* ------------------------------------------------------------------ */

export const attempts = pgTable(
  'attempts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    mode: text('mode', {
      enum: ['diagnostic', 'drill', 'section', 'mock', 'review', 'remediation'],
    }).notNull(),
    skill: text('skill', {
      enum: ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar', 'mixed'],
    }).notNull(),
    /** JSON: how the item selector built this attempt (targets, filters, seed). */
    blueprint: text('blueprint').notNull().default('{}'),
    timed: boolean('timed').notNull().default(true),
    timeLimitSeconds: integer('time_limit_seconds'),
    startedAt: integer('started_at').notNull().default(now),
    completedAt: integer('completed_at'),
    /** Raw correct / total for objective sections. */
    rawScore: integer('raw_score'),
    maxScore: integer('max_score'),
    /** Estimated practice level on the CLB scale (never an official score). */
    estimatedLevel: doublePrecision('estimated_level'),
    /** Standard error of the level estimate — drives confidence language in UI. */
    levelSe: doublePrecision('level_se'),
    abandoned: boolean('abandoned').notNull().default(false),
  },
  (t) => [
    index('attempts_user_idx').on(t.userId, t.orgId, t.startedAt),
    index('attempts_mode_idx').on(t.userId, t.mode, t.completedAt),
  ],
);

export const attemptItems = pgTable(
  'attempt_items',
  {
    id: text('id').primaryKey(),
    attemptId: text('attempt_id')
      .notNull()
      .references(() => attempts.id, { onDelete: 'cascade' }),
    questionId: text('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    /** Version pinned at delivery so later edits never corrupt a past attempt. */
    questionVersion: integer('question_version').notNull().default(1),
    orderIndex: integer('order_index').notNull().default(0),
    response: text('response'),
    correct: boolean('correct'),
    elapsedMs: integer('elapsed_ms').notNull().default(0),
    /** Did the learner change their mind? A signal of uncertainty. */
    changedAnswer: boolean('changed_answer').notNull().default(false),
    flaggedForReview: boolean('flagged_for_review').notNull().default(false),
    answeredAt: integer('answered_at'),
  },
  (t) => [
    index('attempt_items_attempt_idx').on(t.attemptId, t.orderIndex),
    index('attempt_items_question_idx').on(t.questionId),
  ],
);

export const writingSubmissions = pgTable(
  'writing_submissions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    attemptId: text('attempt_id').references(() => attempts.id, { onDelete: 'set null' }),
    taskId: text('task_id')
      .notNull()
      .references(() => writingTasks.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    wordCount: integer('word_count').notNull().default(0),
    /** Planning notes captured in the planner pane — used for coaching, never scored. */
    planNotes: text('plan_notes'),
    elapsedSeconds: integer('elapsed_seconds').notNull().default(0),
    timed: boolean('timed').notNull().default(true),
    /** Keystroke-derived: revisions made after the first draft sentence. */
    revisionCount: integer('revision_count').notNull().default(0),
    submittedAt: integer('submitted_at').notNull().default(now),
  },
  (t) => [index('writing_submissions_user_idx').on(t.userId, t.orgId, t.submittedAt)],
);

export const speakingSubmissions = pgTable(
  'speaking_submissions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    attemptId: text('attempt_id').references(() => attempts.id, { onDelete: 'set null' }),
    taskId: text('task_id')
      .notNull()
      .references(() => speakingTasks.id, { onDelete: 'cascade' }),
    /** Storage key resolved by the storage provider (local disk in dev). */
    audioKey: text('audio_key'),
    audioMimeType: text('audio_mime_type'),
    durationMs: integer('duration_ms').notNull().default(0),
    transcript: text('transcript').notNull().default(''),
    transcriptSource: text('transcript_source', {
      enum: ['browser_asr', 'manual', 'none'],
    })
      .notNull()
      .default('none'),
    /** JSON [{startMs,endMs,rms}] envelope from the Web Audio analyser. */
    timeline: text('timeline'),
    submittedAt: integer('submitted_at').notNull().default(now),
  },
  (t) => [index('speaking_submissions_user_idx').on(t.userId, t.orgId, t.submittedAt)],
);

/** One evaluation row per productive submission (writing or speaking). */
export const evaluations = pgTable(
  'evaluations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    submissionType: text('submission_type', { enum: ['writing', 'speaking'] }).notNull(),
    submissionId: text('submission_id').notNull(),
    /** Which analyser produced this: 'local-linguistic-v1', future 'llm-*'. */
    engine: text('engine').notNull(),
    engineVersion: text('engine_version').notNull(),
    /** JSON {dimension: {level, evidence[], note}} */
    dimensions: text('dimensions').notNull(),
    estimatedLevel: doublePrecision('estimated_level').notNull(),
    /** Half-width of the reported band, e.g. 0.5 → "CLB 9–10". */
    levelSe: doublePrecision('level_se').notNull().default(0.5),
    /** JSON [{severity,category,message,span,suggestion}] */
    findings: text('findings').notNull().default('[]'),
    /** JSON: the strengths / priorities / next-drill coaching payload. */
    coaching: text('coaching').notNull().default('{}'),
    /** Analyses the current engine cannot perform honestly (e.g. phoneme-level). */
    limitations: text('limitations').notNull().default('[]'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [
    index('evaluations_submission_idx').on(t.submissionType, t.submissionId),
    index('evaluations_user_idx').on(t.userId, t.orgId, t.createdAt),
  ],
);

/* ------------------------------------------------------------------ */
/* Learning state                                                      */
/* ------------------------------------------------------------------ */

export const mistakes = pgTable(
  'mistakes',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    source: text('source', {
      enum: ['question', 'writing', 'speaking', 'vocabulary'],
    }).notNull(),
    sourceId: text('source_id'),
    skill: text('skill').notNull(),
    microSkill: text('micro_skill').notNull(),
    /** Stable error taxonomy code, e.g. `inference.overliteral`, `grammar.article`. */
    errorCode: text('error_code').notNull(),
    /** Human-readable, learner-facing statement of what went wrong. */
    summary: text('summary').notNull(),
    detail: text('detail'),
    occurrences: integer('occurrences').notNull().default(1),
    firstSeenAt: integer('first_seen_at').notNull().default(now),
    lastSeenAt: integer('last_seen_at').notNull().default(now),
    /** Cleared once the learner proves the fix on later items. */
    resolvedAt: integer('resolved_at'),
    /** Consecutive successful retests since the last occurrence. */
    provedStreak: integer('proved_streak').notNull().default(0),
  },
  (t) => [
    index('mistakes_user_idx').on(t.userId, t.orgId, t.lastSeenAt),
    uniqueIndex('mistakes_user_code_idx').on(t.userId, t.orgId, t.errorCode, t.microSkill),
  ],
);

/**
 * Unified spaced-retrieval scheduler state. One row per (learner, item).
 * Implements a difficulty/stability/retrievability model — see lib/engines/srs.ts.
 */
export const reviewCards = pgTable(
  'review_cards',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['vocabulary', 'grammar', 'mistake', 'question'] }).notNull(),
    refId: text('ref_id').notNull(),
    stability: doublePrecision('stability').notNull().default(1),
    difficulty: doublePrecision('difficulty').notNull().default(5),
    reps: integer('reps').notNull().default(0),
    lapses: integer('lapses').notNull().default(0),
    lastReviewedAt: integer('last_reviewed_at'),
    dueAt: integer('due_at').notNull().default(now),
    state: text('state', { enum: ['new', 'learning', 'review', 'relearning'] })
      .notNull()
      .default('new'),
  },
  (t) => [
    uniqueIndex('review_cards_ref_idx').on(t.userId, t.orgId, t.kind, t.refId),
    index('review_cards_due_idx').on(t.userId, t.orgId, t.dueAt),
  ],
);

/** Rolling mastery estimate per micro-skill — the core of the diagnosis. */
export const skillEstimates = pgTable(
  'skill_estimates',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    skill: text('skill').notNull(),
    microSkill: text('micro_skill').notNull(),
    /** Ability on the CLB scale (continuous). */
    theta: doublePrecision('theta').notNull().default(7),
    /** Uncertainty; shrinks with evidence. High SE ⇒ "not enough evidence yet". */
    se: doublePrecision('se').notNull().default(2.5),
    observations: integer('observations').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    /** Accuracy under time pressure vs untimed — exposes exam-speed collapse. */
    timedObservations: integer('timed_observations').notNull().default(0),
    timedCorrect: integer('timed_correct').notNull().default(0),
    avgSecondsRatio: doublePrecision('avg_seconds_ratio').notNull().default(1),
    updatedAt: integer('updated_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('skill_estimates_idx').on(t.userId, t.orgId, t.skill, t.microSkill),
    index('skill_estimates_skill_idx').on(t.userId, t.orgId, t.skill),
  ],
);

/** Immutable trace of level estimates so progress charts show real history. */
export const progressSnapshots = pgTable(
  'progress_snapshots',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    skill: text('skill').notNull(),
    estimatedLevel: doublePrecision('estimated_level').notNull(),
    se: doublePrecision('se').notNull().default(1),
    observations: integer('observations').notNull().default(0),
    source: text('source').notNull().default('attempt'),
    sourceId: text('source_id'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [index('progress_snapshots_idx').on(t.userId, t.orgId, t.skill, t.createdAt)],
);

export const recommendations = pgTable(
  'recommendations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    kind: text('kind', {
      enum: ['drill', 'lesson', 'review', 'writing', 'speaking', 'mock', 'diagnostic'],
    }).notNull(),
    skill: text('skill').notNull(),
    microSkill: text('micro_skill'),
    title: text('title').notNull(),
    /** Learner-facing justification: why this, why now. Never a black box. */
    rationale: text('rationale').notNull(),
    /** Expected level gain per minute — the ranking signal. */
    valueScore: doublePrecision('value_score').notNull().default(0),
    estimatedMinutes: integer('estimated_minutes').notNull().default(10),
    href: text('href').notNull(),
    /** JSON payload consumed by the practice launcher. */
    payload: text('payload').notNull().default('{}'),
    generatedAt: integer('generated_at').notNull().default(now),
    expiresAt: integer('expires_at'),
    consumedAt: integer('consumed_at'),
    dismissedAt: integer('dismissed_at'),
  },
  (t) => [index('recommendations_user_idx').on(t.userId, t.orgId, t.generatedAt)],
);

export const studyPlans = pgTable(
  'study_plans',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    horizonDays: integer('horizon_days').notNull().default(30),
    startDate: text('start_date').notNull(),
    targetLevel: integer('target_level').notNull().default(12),
    /** JSON: the generated schedule; regenerated when performance shifts. */
    schedule: text('schedule').notNull(),
    /** Why the plan is shaped this way — shown to the learner. */
    rationale: text('rationale').notNull().default(''),
    generatedAt: integer('generated_at').notNull().default(now),
    supersededAt: integer('superseded_at'),
  },
  (t) => [index('study_plans_user_idx').on(t.userId, t.orgId, t.generatedAt)],
);

export const planCompletions = pgTable(
  'plan_completions',
  {
    id: text('id').primaryKey(),
    planId: text('plan_id')
      .notNull()
      .references(() => studyPlans.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dayIndex: integer('day_index').notNull(),
    blockId: text('block_id').notNull(),
    completedAt: integer('completed_at').notNull().default(now),
    attemptId: text('attempt_id'),
  },
  (t) => [uniqueIndex('plan_completions_idx').on(t.planId, t.dayIndex, t.blockId)],
);

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id'),
    actorId: text('actor_id'),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    metadata: text('metadata').notNull().default('{}'),
    ipHash: text('ip_hash'),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [index('audit_logs_org_idx').on(t.orgId, t.createdAt)],
);

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  windowStart: integer('window_start').notNull().default(now),
});
