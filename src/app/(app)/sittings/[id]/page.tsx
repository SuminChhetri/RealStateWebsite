import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { checkFeature, requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { attemptItems, attempts, questions } from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { buildSittingReport } from '@/lib/engines/sitting-report';
import { LockedFeature } from '@/components/LockedFeature';
import { SKILL_LABELS, type Domain } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Sitting report' };
export const dynamic = 'force-dynamic';

/**
 * The forensic view of one sitting.
 *
 * Free feedback answers "why was this item wrong". This answers "how did this
 * sitting go as a performance" — pace, endurance across the section, whether
 * marks went on items that should have been comfortable, whether changing an
 * answer helped. Those are recoverable marks that per-item feedback cannot
 * surface, because none of them are visible from inside a single item.
 */
export default async function SittingReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const gate = await checkFeature(session, 'sitting_report');

  const [attempt] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, id), eq(attempts.userId, session.userId), eq(attempts.orgId, session.orgId)))
    .limit(1);
  if (!attempt) notFound();

  if (!gate.allowed) {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Sitting report</p>
            <h1>How the sitting went, not just what was wrong</h1>
            <p className="muted measure-wide">
              Pace against the clock, whether accuracy held to the end, where the losses concentrated, and
              whether the marks went on items that should have been comfortable.
            </p>
          </div>
        </header>
        <LockedFeature
          feature="sitting_report"
          currentPlan={gate.plan}
          requiredPlan={gate.required}
          what="the forensic sitting report"
        />
        <p className="small muted" style={{ marginTop: 'var(--s5)' }}>
          The per-item feedback for this sitting is free and always will be —{' '}
          <Link href={`/session/${id}/results`}>read it here</Link>.
        </p>
      </div>
    );
  }

  const rows = await db
    .select({
      orderIndex: attemptItems.orderIndex,
      correct: attemptItems.correct,
      elapsedMs: attemptItems.elapsedMs,
      answeredAt: attemptItems.answeredAt,
      changedAnswer: attemptItems.changedAnswer,
      flagged: attemptItems.flaggedForReview,
      targetSeconds: questions.targetSeconds,
      difficulty: questions.difficulty,
      microSkill: questions.microSkill,
      partType: questions.partType,
    })
    .from(attemptItems)
    .innerJoin(questions, eq(questions.id, attemptItems.questionId))
    .where(eq(attemptItems.attemptId, id))
    .orderBy(attemptItems.orderIndex);

  const profile = await getProfile(session.userId, session.orgId);
  const estimate = profile.skills.find((s) => s.skill === attempt.skill);

  const report = buildSittingReport({
    items: rows.map((row) => ({
      orderIndex: row.orderIndex,
      correct: row.correct,
      elapsedMs: row.elapsedMs ?? 0,
      targetSeconds: row.targetSeconds,
      difficulty: row.difficulty,
      microSkill: row.microSkill,
      partType: row.partType,
      changedAnswer: row.changedAnswer,
      flagged: row.flagged,
      answered: row.answeredAt !== null,
    })),
    timeLimitSeconds: attempt.timeLimitSeconds,
    ability: estimate?.level ?? attempt.estimatedLevel ?? 7,
  });

  const minutes = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const taken = new Date(attempt.startedAt * 1000).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-narrow">
      <header className="page-header" data-skill={attempt.skill}>
        <div className="stack stack-3">
          <p className="eyebrow row-tight">
            <span className="skill-mark" aria-hidden />
            Sitting report · {taken}
          </p>
          <h1>
            {SKILL_LABELS[attempt.skill as Domain] ?? attempt.skill} · {attempt.mode}
          </h1>
          <p className="muted measure-wide">
            {report.correct} of {report.items} correct ({Math.round(report.accuracy * 100)}%) ·{' '}
            {minutes(report.secondsUsed)} of {minutes(report.secondsBudget)} used ·{' '}
            {report.medianPace.toFixed(2)}× the intended pace
          </p>
        </div>
      </header>

      {/* --- What the sitting says --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            What this sitting says
          </h2>
          <p className="tiny faint">Only what the timing and correctness data supports</p>
        </div>
        <div className="stack stack-3">
          {report.findings.map((finding) => (
            <article
              key={finding.key}
              className="panel"
              style={{
                borderLeft: `3px solid var(--${
                  finding.severity === 'critical'
                    ? 'critical'
                    : finding.severity === 'caution'
                      ? 'caution'
                      : finding.severity === 'positive'
                        ? 'positive'
                        : 'rule-strong'
                })`,
              }}
            >
              <div className="stack stack-2">
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {finding.title}
                </h3>
                <p className="small measure-wide">{finding.detail}</p>
                {finding.action ? (
                  <p className="small muted measure-wide">
                    <strong>Do this:</strong> {finding.action}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* --- Endurance --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Across the sitting
          </h2>
          <p className="tiny faint">Whether it held to the end</p>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Section</th>
                <th scope="col">Items</th>
                <th scope="col">Accuracy</th>
                <th scope="col">Pace</th>
              </tr>
            </thead>
            <tbody>
              {report.thirds.map((third) => (
                <tr key={third.label}>
                  <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>
                    {third.label}
                  </th>
                  <td className="num numeric">{third.items}</td>
                  <td className="num numeric">{third.items ? `${Math.round(third.accuracy * 100)}%` : '—'}</td>
                  <td className="num numeric">{third.medianPace ? `${third.medianPace.toFixed(2)}×` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Difficulty --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Against your own level
          </h2>
          <p className="tiny faint">“Hard” only means anything relative to you</p>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Band</th>
                <th scope="col">Attempted</th>
                <th scope="col">Correct</th>
                <th scope="col">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {report.byDifficulty.map((band) => (
                <tr key={band.band}>
                  <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>
                    {band.band}
                  </th>
                  <td className="num numeric">{band.attempted}</td>
                  <td className="num numeric">{band.correct}</td>
                  <td className="num numeric">
                    {band.attempted ? `${Math.round((band.correct / band.attempted) * 100)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Where the marks went --- */}
      {report.losses.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Where the marks went
            </h2>
            <p className="tiny faint">By count, not by rate</p>
          </div>
          <div className="stack stack-3">
            {report.losses.map((loss) => (
              <div key={loss.microSkill} className="stack stack-1">
                <div className="row-between">
                  <span className="small" style={{ fontWeight: 500 }}>
                    {loss.label}
                  </span>
                  <span className="tiny faint numeric">
                    {loss.wrong} of {loss.attempted} wrong · {Math.round(loss.share * 100)}% of losses ·{' '}
                    {loss.medianPace.toFixed(2)}× pace
                  </span>
                </div>
                <div className="meter" style={{ height: 8 }}>
                  <span style={{ width: `${Math.max(2, loss.share * 100)}%`, background: 'var(--skill)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel-quiet stack stack-3">
        <p className="eyebrow">Also worth knowing</p>
        <ul className="stack stack-2" style={{ paddingLeft: '1.1rem' }}>
          <li className="small">
            <strong>Changed answers:</strong> {report.changed.count} changed, {report.changed.helped} ended
            correct.
          </li>
          <li className="small">
            <strong>Flagged for review:</strong> {report.flagged.count} flagged, {report.flagged.correct} correct.
          </li>
          <li className="small">
            <strong>Left blank:</strong> {report.unanswered}.
          </li>
        </ul>
        <p className="tiny faint">
          <Link href={`/session/${id}/results`}>The per-item feedback</Link> for this sitting is free and covers
          why each individual answer was wrong.
        </p>
      </section>
    </div>
  );
}
