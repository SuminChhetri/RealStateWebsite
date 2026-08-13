import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, sql } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { attemptItems, attempts, learnerProfiles, questions } from '@/lib/db/schema';
import { getProfile, skillTrend } from '@/lib/learner/profile';
import { SKILLS, SKILL_LABELS, tryMicroSkill, type Skill } from '@/lib/content/taxonomy';
import { EstimateFootnote, EstimateLabel } from '@/components/Level';
import { TrendChart } from '@/components/TrendChart';
import { pacingVerdict } from '@/lib/engines/ability';

export const metadata: Metadata = { title: 'Progress' };
export const dynamic = 'force-dynamic';

/**
 * Every chart on this page answers a question a learner actually asks. Nothing
 * is here because it is easy to plot.
 */
export default async function ProgressPage() {
  const session = await requireSession();
  const profile = getProfile(session.userId, session.orgId);

  const trends = Object.fromEntries(
    SKILLS.map((skill) => [skill, skillTrend(session.userId, session.orgId, skill)]),
  ) as Record<Skill, { level: number; se: number; createdAt: number; observations: number }[]>;

  const profileRow = db
    .select()
    .from(learnerProfiles)
    .where(and(eq(learnerProfiles.userId, session.userId), eq(learnerProfiles.orgId, session.orgId)))
    .get();
  const confidence = profileRow?.confidence ? (JSON.parse(profileRow.confidence) as Record<string, number>) : {};

  // Where points are actually lost: accuracy by micro-skill, weighted by how
  // often each one appears.
  const lossRows = db
    .select({
      microSkill: questions.microSkill,
      skill: questions.skill,
      total: sql<number>`count(*)`,
      wrong: sql<number>`sum(case when ${attemptItems.correct} = 0 then 1 else 0 end)`,
    })
    .from(attemptItems)
    .innerJoin(attempts, eq(attempts.id, attemptItems.attemptId))
    .innerJoin(questions, eq(questions.id, attemptItems.questionId))
    .where(
      and(
        eq(attempts.userId, session.userId),
        eq(attempts.orgId, session.orgId),
        sql`${attempts.completedAt} is not null`,
      ),
    )
    .groupBy(questions.microSkill, questions.skill)
    .all()
    .filter((r) => r.total >= 3)
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 8);

  const recent = db
    .select({
      id: attempts.id,
      mode: attempts.mode,
      skill: attempts.skill,
      startedAt: attempts.startedAt,
      rawScore: attempts.rawScore,
      maxScore: attempts.maxScore,
      estimatedLevel: attempts.estimatedLevel,
    })
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, session.userId),
        eq(attempts.orgId, session.orgId),
        sql`${attempts.completedAt} is not null`,
      ),
    )
    .orderBy(desc(attempts.startedAt))
    .limit(10)
    .all();

  const totalWrong = lossRows.reduce((a, r) => a + Number(r.wrong), 0);

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Progress</p>
          <h1>Am I improving?</h1>
          <p className="muted measure-wide">
            Each estimate carries an uncertainty band. Movement inside that band is not progress, and this page
            says so rather than drawing an encouraging line.
          </p>
        </div>
      </header>

      {/* --- Am I improving? --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Your estimates over time
          </h2>
          <p className="tiny faint">Dashed line: your target</p>
        </div>
        <div className="grid grid-2">
          {SKILLS.map((skill) => {
            const estimate = profile.skills.find((s) => s.skill === skill)!;
            return (
              <article key={skill} className="panel-quiet" data-skill={skill}>
                <div className="stack stack-4">
                  <div className="row-between">
                    <h3 className="row-tight" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      <span className="skill-mark" aria-hidden />
                      {SKILL_LABELS[skill]}
                    </h3>
                    <EstimateLabel level={estimate.level} se={estimate.se} observations={estimate.observations} />
                  </div>
                  <TrendChart points={trends[skill]} target={profile.targetLevel} label={SKILL_LABELS[skill]} />
                </div>
              </article>
            );
          })}
        </div>
        <div style={{ marginTop: 'var(--s4)' }}>
          <EstimateFootnote />
        </div>
      </section>

      {/* --- What is holding me back? --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Where you lose the most points
          </h2>
          <p className="tiny faint">By count of wrong answers, not by rate</p>
        </div>
        {lossRows.length ? (
          <div className="stack stack-3">
            {lossRows.map((row) => {
              const share = totalWrong ? Number(row.wrong) / totalWrong : 0;
              const accuracy = 1 - Number(row.wrong) / Number(row.total);
              return (
                <div key={row.microSkill} data-skill={row.skill} className="stack stack-1">
                  <div className="row-between">
                    <span className="small" style={{ fontWeight: 500 }}>
                      {tryMicroSkill(row.microSkill)?.label ?? row.microSkill}
                    </span>
                    <span className="tiny faint numeric">
                      {row.wrong} wrong of {row.total} · {Math.round(accuracy * 100)}% accurate
                    </span>
                  </div>
                  <div className="meter" style={{ height: 8 }}>
                    <span style={{ width: `${Math.max(2, share * 100)}%`, background: 'var(--skill)' }} />
                  </div>
                </div>
              );
            })}
            <p className="tiny faint">
              Ranked by total losses rather than accuracy: a micro-skill you get wrong 40% of the time but rarely
              meet costs you less than one you get wrong 20% of the time on every set.
            </p>
          </div>
        ) : (
          <div className="empty">
            <h3>Not enough data yet</h3>
            <p className="small">Complete a few practice sets and this will show where your losses concentrate.</p>
          </div>
        )}
      </section>

      {/* --- Exam speed --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Timed versus untimed
          </h2>
        </div>
        <div className="grid grid-2">
          {profile.skills
            .filter((s) => s.skill === 'reading' || s.skill === 'listening')
            .map((estimate) => {
              const micro = profile.microEstimates.filter((m) => m.skill === estimate.skill);
              const avgRatio = micro.length
                ? micro.reduce((a, m) => a + m.avgSecondsRatio, 0) / micro.length
                : 1;
              const accuracy = micro.length
                ? micro.reduce((a, m) => a + m.correct, 0) / Math.max(1, micro.reduce((a, m) => a + m.observations, 0))
                : 0;
              const verdict = pacingVerdict(avgRatio, accuracy);
              return (
                <div key={estimate.skill} className="panel-quiet" data-skill={estimate.skill}>
                  <div className="stack stack-3">
                    <h3 className="row-tight" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      <span className="skill-mark" aria-hidden />
                      {SKILL_LABELS[estimate.skill as Skill]}
                    </h3>
                    {estimate.timePressureGap !== null ? (
                      <p className="small">
                        Untimed accuracy runs{' '}
                        <strong className="numeric">{estimate.timePressureGap.toFixed(1)} levels</strong>{' '}
                        {estimate.timePressureGap > 0 ? 'above' : 'below'} timed accuracy.
                      </p>
                    ) : (
                      <p className="small muted">
                        Not enough of both kinds of practice yet to compare. Ten items each way is the threshold.
                      </p>
                    )}
                    <p className="small muted">
                      Median pace {avgRatio.toFixed(2)}× the target time. {verdict.label}.
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* --- Confidence versus performance --- */}
      {Object.keys(confidence).length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              How it feels versus how it goes
            </h2>
            <p className="tiny faint">Your ratings at sign-up against measured level</p>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Skill</th>
                  <th scope="col">You said</th>
                  <th scope="col">Measured</th>
                  <th scope="col">Reading of the gap</th>
                </tr>
              </thead>
              <tbody>
                {SKILLS.map((skill) => {
                  const rating = confidence[skill];
                  const estimate = profile.skills.find((s) => s.skill === skill)!;
                  if (!rating || !estimate.observations) return null;
                  // Map 1–5 self-rating onto the CLB scale for comparison only.
                  const implied = 5 + (rating - 1) * 1.75;
                  const gap = estimate.level - implied;
                  return (
                    <tr key={skill}>
                      <th scope="row" style={{ fontWeight: 500, textTransform: 'none', fontSize: '0.875rem', color: 'var(--ink)', letterSpacing: 0 }}>
                        {SKILL_LABELS[skill]}
                      </th>
                      <td className="num">{['Struggling', 'Shaky', 'Mixed', 'Solid', 'Strong'][rating - 1]}</td>
                      <td className="num">CLB {estimate.level.toFixed(1)}</td>
                      <td className="small muted">
                        {gap > 1.2
                          ? 'You are better at this than you think — trust it under pressure.'
                          : gap < -1.2
                            ? 'This feels stronger than it measures. Worth the practice time.'
                            : 'Your sense of this skill matches the evidence.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* --- Recent activity --- */}
      {recent.length ? (
        <section>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Recent sets</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Type</th>
                  <th scope="col">Skill</th>
                  <th scope="col">Score</th>
                  <th scope="col">Estimate</th>
                  <th scope="col"><span className="visually-hidden">Feedback</span></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td className="num">{new Date(row.startedAt * 1000).toLocaleDateString('en-CA')}</td>
                    <td>{row.mode}</td>
                    <td>{row.skill}</td>
                    <td className="num">
                      {row.rawScore ?? 0}/{row.maxScore ?? 0}
                    </td>
                    <td className="num">{row.estimatedLevel ? row.estimatedLevel.toFixed(1) : '—'}</td>
                    <td>
                      <Link className="small" href={`/session/${row.id}/results`}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
