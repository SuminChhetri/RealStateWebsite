import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  attempts,
  evaluations,
  learnerProfiles,
  mistakes,
  progressSnapshots,
  reviewCards,
  skillEstimates,
  speakingSubmissions,
  writingSubmissions,
} from '../db/schema';
import { newId } from '../ids';
import { aggregateSkill, decayBelief, type MicroEstimate, type SkillEstimate } from '../engines/ability';
import { recommend, readiness, type Recommendation } from '../engines/recommend';
import { SKILLS, tryMicroSkill, type Domain, type Skill } from '../content/taxonomy';
import { evidenceQuality, levelBand } from '../content/clb';

/**
 * The learner profile: one read that assembles everything the personalised
 * surfaces need. Kept in one place so "what do we know about this learner" has
 * exactly one answer, and so the expensive joins happen once per page rather
 * than once per component.
 */

export interface LearnerProfile {
  targetLevel: number;
  examDate: string | null;
  daysToExam: number | null;
  minutesPerDay: number;
  daysPerWeek: number;
  goalContext: string;
  onboarded: boolean;
  hasDiagnostic: boolean;
  skills: SkillEstimate[];
  microEstimates: MicroEstimate[];
  readiness: ReturnType<typeof readiness>;
  dueReviewCount: number;
  openMistakes: number;
  totalAttempts: number;
  productiveCounts: { writing: number; speaking: number };
  daysSincePractice: Record<string, number>;
  streakDays: number;
  minutesThisWeek: number;
}

export async function ensureProfile(userId: string, orgId: string) {
  const [existing] = await db
    .select()
    .from(learnerProfiles)
    .where(and(eq(learnerProfiles.userId, userId), eq(learnerProfiles.orgId, orgId)))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(learnerProfiles)
    .values({ id: newId('lpr'), userId, orgId })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  // Lost the race with a concurrent request; read the row it inserted.
  const [row] = await db
    .select()
    .from(learnerProfiles)
    .where(and(eq(learnerProfiles.userId, userId), eq(learnerProfiles.orgId, orgId)))
    .limit(1);
  return row;
}

export async function getProfile(userId: string, orgId: string): Promise<LearnerProfile> {
  const row = await ensureProfile(userId, orgId);
  const now = Math.floor(Date.now() / 1000);

  const estimateRows = await db
    .select()
    .from(skillEstimates)
    .where(and(eq(skillEstimates.userId, userId), eq(skillEstimates.orgId, orgId)));

  const microEstimates: MicroEstimate[] = estimateRows.map((e) => {
    const days = (now - e.updatedAt) / 86400;
    const decayed = decayBelief({ theta: e.theta, se: e.se }, days);
    return {
      microSkill: e.microSkill,
      skill: e.skill,
      theta: decayed.theta,
      se: decayed.se,
      observations: e.observations,
      correct: e.correct,
      timedObservations: e.timedObservations,
      timedCorrect: e.timedCorrect,
      avgSecondsRatio: e.avgSecondsRatio,
    };
  });

  // Productive skills are estimated from evaluations, not from item responses.
  const productiveEstimates = new Map<Skill, { level: number; se: number; count: number }>();
  for (const skill of ['writing', 'speaking'] as const) {
    const rows = await db
      .select({ level: evaluations.estimatedLevel, se: evaluations.levelSe, createdAt: evaluations.createdAt })
      .from(evaluations)
      .where(
        and(
          eq(evaluations.userId, userId),
          eq(evaluations.orgId, orgId),
          eq(evaluations.submissionType, skill),
        ),
      )
      .orderBy(desc(evaluations.createdAt))
      .limit(6);
    if (!rows.length) continue;
    // Recency-weighted: the most recent submission says more about current
    // ability than one from six weeks ago.
    let weightSum = 0;
    let weighted = 0;
    rows.forEach((r, index) => {
      const weight = 1 / (index + 1);
      weighted += r.level * weight;
      weightSum += weight;
    });
    const level = weighted / weightSum;
    const spread = rows.length > 1 ? Math.sqrt(rows.reduce((a, r) => a + (r.level - level) ** 2, 0) / rows.length) : 0;
    const se = Math.max(0.4, Math.min(2, rows[0].se * (1 / Math.sqrt(rows.length)) + spread * 0.4));
    productiveEstimates.set(skill, { level, se, count: rows.length });
  }

  const skills: SkillEstimate[] = SKILLS.map((skill) => {
    if (skill === 'writing' || skill === 'speaking') {
      const p = productiveEstimates.get(skill);
      const micro = microEstimates.filter((m) => m.skill === skill);
      if (!p) {
        return {
          skill,
          level: 0,
          se: 2.5,
          observations: 0,
          weakest: [],
          strongest: [],
          timePressureGap: null,
          coverage: 0,
        };
      }
      const aggregate = aggregateSkill(skill as Domain, micro);
      return {
        ...aggregate,
        skill,
        level: Math.round(p.level * 100) / 100,
        se: Math.round(p.se * 100) / 100,
        observations: Math.max(aggregate.observations, p.count),
      };
    }
    return aggregateSkill(skill as Domain, microEstimates.filter((m) => m.skill === skill));
  });

  const [dueReviews] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviewCards)
    .where(and(eq(reviewCards.userId, userId), eq(reviewCards.orgId, orgId), sql`${reviewCards.dueAt} <= ${now}`));
  const dueReviewCount = dueReviews?.count ?? 0;

  const [openMistakeRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mistakes)
    .where(and(eq(mistakes.userId, userId), eq(mistakes.orgId, orgId), sql`${mistakes.resolvedAt} is null`));
  const openMistakes = openMistakeRow?.count ?? 0;

  const attemptRows = await db
    .select({ skill: attempts.skill, startedAt: attempts.startedAt, completedAt: attempts.completedAt, mode: attempts.mode })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.orgId, orgId)))
    .orderBy(desc(attempts.startedAt));

  const daysSincePractice: Record<string, number> = {};
  for (const skill of SKILLS) {
    const latest = attemptRows.find((a) => a.skill === skill && a.completedAt);
    daysSincePractice[skill] = latest ? Math.floor((now - latest.startedAt) / 86400) : 999;
  }

  const [writingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(writingSubmissions)
    .where(and(eq(writingSubmissions.userId, userId), eq(writingSubmissions.orgId, orgId)));
  const [speakingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(speakingSubmissions)
    .where(and(eq(speakingSubmissions.userId, userId), eq(speakingSubmissions.orgId, orgId)));
  const writingCount = writingRow?.count ?? 0;
  const speakingCount = speakingRow?.count ?? 0;

  const daysToExam = row.examDate
    ? Math.max(0, Math.ceil((Date.parse(`${row.examDate}T00:00:00Z`) / 1000 - now) / 86400))
    : null;

  return {
    targetLevel: row.targetLevel,
    examDate: row.examDate,
    daysToExam,
    minutesPerDay: row.minutesPerDay,
    daysPerWeek: row.daysPerWeek,
    goalContext: row.goalContext,
    onboarded: !!row.onboardedAt,
    hasDiagnostic: !!row.diagnosticAttemptId || attemptRows.some((a) => a.mode === 'diagnostic' && a.completedAt),
    skills,
    microEstimates,
    readiness: readiness(skills, row.targetLevel),
    dueReviewCount,
    openMistakes,
    totalAttempts: attemptRows.filter((a) => a.completedAt).length,
    productiveCounts: { writing: writingCount, speaking: speakingCount },
    daysSincePractice,
    streakDays: computeStreak(attemptRows.filter((a) => a.completedAt).map((a) => a.startedAt), now),
    minutesThisWeek: await estimateMinutesThisWeek(userId, orgId, now),
  };
}

function computeStreak(timestamps: number[], now: number): number {
  if (!timestamps.length) return 0;
  const days = new Set(timestamps.map((t) => Math.floor(t / 86400)));
  const today = Math.floor(now / 86400);
  let streak = 0;
  // A streak survives one missed day: an all-or-nothing counter punishes the
  // learner who studies six days a week, which is the behaviour we want.
  let cursor = days.has(today) ? today : today - 1;
  let grace = 1;
  while (cursor > today - 400) {
    if (days.has(cursor)) {
      streak++;
      cursor--;
    } else if (grace > 0 && streak > 0) {
      grace--;
      cursor--;
    } else {
      break;
    }
  }
  return streak;
}

async function estimateMinutesThisWeek(userId: string, orgId: string, now: number): Promise<number> {
  const weekAgo = now - 7 * 86400;
  const rows = await db
    .select({ startedAt: attempts.startedAt, completedAt: attempts.completedAt })
    .from(attempts)
    .where(
      and(eq(attempts.userId, userId), eq(attempts.orgId, orgId), gt(attempts.startedAt, weekAgo)),
    );
  const seconds = rows.reduce((a, r) => a + (r.completedAt ? Math.min(3600, r.completedAt - r.startedAt) : 0), 0);
  return Math.round(seconds / 60);
}

export async function getRecommendations(
  userId: string,
  orgId: string,
  profile: LearnerProfile,
): Promise<Recommendation[]> {
  const mistakeRows = await db
    .select()
    .from(mistakes)
    .where(and(eq(mistakes.userId, userId), eq(mistakes.orgId, orgId), sql`${mistakes.resolvedAt} is null`))
    .orderBy(desc(mistakes.occurrences))
    .limit(20);

  return recommend({
    targetLevel: profile.targetLevel,
    examDate: profile.examDate,
    minutesAvailable: profile.minutesPerDay,
    skills: profile.skills,
    microEstimates: profile.microEstimates.map((m) => ({
      microSkill: m.microSkill,
      skill: m.skill,
      theta: m.theta,
      se: m.se,
      observations: m.observations,
    })),
    mistakes: mistakeRows.map((m) => ({
      errorCode: m.errorCode,
      microSkill: m.microSkill,
      skill: m.skill,
      summary: m.summary,
      occurrences: m.occurrences,
      lastSeenAt: m.lastSeenAt,
      provedStreak: m.provedStreak,
    })),
    dueReviewCount: profile.dueReviewCount,
    daysSincePractice: profile.daysSincePractice,
    productiveCounts: profile.productiveCounts,
    hasDiagnostic: profile.hasDiagnostic,
    now: Math.floor(Date.now() / 1000),
  });
}

export async function skillTrend(userId: string, orgId: string, skill: string, limit = 40) {
  return db
    .select({
      level: progressSnapshots.estimatedLevel,
      se: progressSnapshots.se,
      createdAt: progressSnapshots.createdAt,
      observations: progressSnapshots.observations,
    })
    .from(progressSnapshots)
    .where(
      and(
        eq(progressSnapshots.userId, userId),
        eq(progressSnapshots.orgId, orgId),
        eq(progressSnapshots.skill, skill),
      ),
    )
    .orderBy(progressSnapshots.createdAt)
    .limit(limit);
}

/** Presentation helper: the honest label for a skill estimate. */
export function describeEstimate(estimate: SkillEstimate) {
  if (!estimate.observations) {
    return { label: 'Not measured yet', band: null, quality: evidenceQuality(0, 2.5) };
  }
  return {
    label: `CLB ${estimate.level.toFixed(1)}`,
    band: levelBand(estimate.level, estimate.se),
    quality: evidenceQuality(estimate.observations, estimate.se),
  };
}

export function microLabel(slug: string): string {
  return tryMicroSkill(slug)?.label ?? slug;
}
