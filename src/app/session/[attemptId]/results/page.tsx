import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq, inArray } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { attemptItems, attempts, questions, stimuli } from '@/lib/db/schema';
import { buildResultFromStored } from '@/lib/practice/submit';
import { getProfile } from '@/lib/learner/profile';
import { tryMicroSkill } from '@/lib/content/taxonomy';
import { EstimateFootnote } from '@/components/Level';
import { pacingVerdict } from '@/lib/engines/ability';
import '../../runner.css';

export const metadata: Metadata = { title: 'Feedback', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await requireSession();

  const result = await buildResultFromStored(attemptId, session.userId, session.orgId);
  if (!result) notFound();

  const attempt = (await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, session.userId)))
    .limit(1))[0]!;

  const profile = await getProfile(session.userId, session.orgId);

  // Listening transcripts are released only now — withholding them during the
  // set is what makes it a listening test rather than a reading one.
  const stimulusIds = (await db
    .select({ stimulusId: questions.stimulusId })
    .from(attemptItems)
    .innerJoin(questions, eq(questions.id, attemptItems.questionId))
    .where(eq(attemptItems.attemptId, attemptId))
    )
    .map((r) => r.stimulusId)
    .filter((x): x is string => !!x);

  const transcripts = stimulusIds.length
    ? (await db
        .select({ id: stimuli.id, title: stimuli.title, script: stimuli.script })
        .from(stimuli)
        .where(and(inArray(stimuli.id, [...new Set(stimulusIds)]), eq(stimuli.skill, 'listening')))
        )
    : [];

  const wrong = result.items.filter((i) => !i.correct);
  const accuracy = result.maxScore ? Math.round((result.rawScore / result.maxScore) * 100) : 0;
  const weakest = result.microBreakdown[0];
  const pacing = pacingVerdict(result.pacing.medianRatio, result.rawScore / Math.max(1, result.maxScore));

  return (
    <main id="main" className="page-narrow">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">{result.mode === 'diagnostic' ? 'Diagnostic complete' : 'Set complete'}</p>
          <h1>
            {result.rawScore} of {result.maxScore} correct
          </h1>
          <p className="muted measure-wide">
            {buildHeadline(accuracy, weakest, result.mode)}
          </p>
        </div>
      </header>

      {/* --- What this changed --- */}
      <section className="panel" style={{ marginBottom: 'var(--s6)' }}>
        <div className="grid grid-3">
          <div className="stack stack-1">
            <p className="eyebrow">Accuracy</p>
            <p className="numeric" style={{ fontSize: '1.5rem' }}>
              {accuracy}%
            </p>
          </div>
          <div className="stack stack-1">
            <p className="eyebrow">Pace</p>
            <p className="numeric" style={{ fontSize: '1.5rem' }}>
              {result.pacing.medianRatio.toFixed(2)}×
            </p>
            <p className="tiny faint">{pacing.label}</p>
          </div>
          {attempt.estimatedLevel ? (
            <div className="stack stack-1">
              <p className="eyebrow">Practice estimate</p>
              <p className="numeric" style={{ fontSize: '1.5rem' }}>
                {attempt.estimatedLevel.toFixed(1)}
              </p>
              <p className="tiny faint">± {(attempt.levelSe ?? 1).toFixed(1)}</p>
            </div>
          ) : null}
        </div>

        {result.provedMistakes > 0 || result.newMistakes > 0 ? (
          <p className="small muted" style={{ marginTop: 'var(--s4)' }}>
            {result.newMistakes > 0
              ? `${result.newMistakes} new mistake${result.newMistakes === 1 ? '' : 's'} recorded. `
              : ''}
            {result.provedMistakes > 0
              ? `${result.provedMistakes} previously recorded mistake${result.provedMistakes === 1 ? '' : 's'} cleared — you have now proved the fix three times.`
              : ''}
          </p>
        ) : null}

        <div style={{ marginTop: 'var(--s4)' }}>
          <EstimateFootnote />
        </div>
      </section>

      {/* --- Micro-skill breakdown: the diagnosis --- */}
      {result.microBreakdown.length > 1 ? (
        <section style={{ marginBottom: 'var(--s6)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              What this set measured
            </h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Micro-skill</th>
                  <th scope="col">This set</th>
                  <th scope="col">Your estimate</th>
                  <th scope="col">What to watch for</th>
                </tr>
              </thead>
              <tbody>
                {result.microBreakdown.map((row) => {
                  const meta = tryMicroSkill(row.microSkill);
                  return (
                    <tr key={row.microSkill}>
                      <th scope="row" style={{ fontWeight: 500, textTransform: 'none', fontSize: '0.875rem', color: 'var(--ink)', letterSpacing: 0 }}>
                        {row.label}
                      </th>
                      <td className="num">
                        {row.correct}/{row.total}
                      </td>
                      <td className="num">CLB {row.theta.toFixed(1)}</td>
                      <td className="small muted">{meta?.discriminator ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* --- Item review --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {wrong.length ? `The ${wrong.length} you missed` : 'Every item, with the reasoning'}
          </h2>
          <p className="tiny faint">Wrong answers first</p>
        </div>

        <ol className="stack stack-4" style={{ listStyle: 'none', padding: 0 }}>
          {[...result.items]
            .sort((a, b) => Number(a.correct) - Number(b.correct))
            .map((item) => {
              const chosen = item.options.find((o) => o.key === item.response);
              const key = item.options.find((o) => o.key === item.answerKey)!;
              return (
                <li key={item.questionId} className="panel-quiet">
                  <div className="stack stack-4">
                    <div className="row-between wrap">
                      <span className={`badge ${item.correct ? 'badge-positive' : 'badge-critical'}`}>
                        {item.correct ? 'Correct' : item.response ? 'Incorrect' : 'Not answered'}
                      </span>
                      <span className="tiny faint">
                        {tryMicroSkill(item.microSkill)?.label ?? item.microSkill}
                        {item.elapsedMs > 0
                          ? ` · ${Math.round(item.elapsedMs / 1000)}s of ${item.targetSeconds}s target`
                          : ''}
                      </span>
                    </div>

                    <p style={{ fontFamily: 'var(--font-reading)', fontSize: '1rem', whiteSpace: 'pre-line' }}>
                      {item.prompt}
                    </p>

                    {!item.correct && chosen ? (
                      <div className="stack stack-2">
                        <p className="small">
                          <span className="muted">You chose: </span>
                          {chosen.text}
                        </p>
                        <p className="small" style={{ color: 'var(--critical)' }}>
                          {chosen.rationale}
                        </p>
                      </div>
                    ) : null}

                    <div className="stack stack-2">
                      <p className="small">
                        <span className="muted">Answer: </span>
                        {key.text}
                      </p>
                      <p className="small" style={{ color: 'var(--ink-secondary)' }}>
                        {key.rationale}
                      </p>
                    </div>

                    <div className="inset stack stack-2">
                      <p className="eyebrow">Why</p>
                      <p className="small">{item.explanation}</p>
                      {item.takeaway ? (
                        <p className="small" style={{ fontWeight: 500 }}>
                          Rule of thumb: {item.takeaway}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
        </ol>
      </section>

      {/* --- Transcripts --- */}
      {transcripts.length ? (
        <section style={{ marginBottom: 'var(--s6)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Transcripts</h2>
            <p className="tiny faint">Released after submission</p>
          </div>
          <div className="stack stack-4">
            {transcripts.map((t) => (
              <details key={t.id} className="panel-quiet">
                <summary style={{ cursor: 'pointer', fontWeight: 500 }}>{t.title}</summary>
                <div className="stack stack-2" style={{ marginTop: 'var(--s4)' }}>
                  {(JSON.parse(t.script ?? '[]') as { speaker: string; text: string }[]).map((turn, i) => (
                    <p key={i} className="small">
                      <strong>{turn.speaker}:</strong> {turn.text}
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- What next --- */}
      <section className="panel">
        <div className="stack stack-4">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>What to do next</h2>
          <p className="small muted measure-wide">
            {weakest && weakest.correct < weakest.total
              ? `${weakest.label} was the weakest micro-skill in this set. The fastest way to close it is a targeted set at the difficulty where you are getting about two-thirds right, followed by a retest in a few days.`
              : 'Nothing in this set points to a single weakness. Your next highest-value action is on the Today page, built from your whole profile rather than this one set.'}
          </p>
          <div className="row wrap">
            {weakest && weakest.correct < weakest.total ? (
              <Link
                className="btn btn-primary"
                href={`/practice/${result.skill === 'mixed' ? 'reading' : result.skill}?micro=${encodeURIComponent(weakest.microSkill)}`}
              >
                Targeted set: {weakest.label.toLowerCase()}
              </Link>
            ) : null}
            <Link className="btn" href="/home">
              Back to today
            </Link>
            {profile.dueReviewCount > 0 ? (
              <Link className="btn" href="/review">
                {profile.dueReviewCount} review{profile.dueReviewCount === 1 ? '' : 's'} due
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function buildHeadline(
  accuracy: number,
  weakest: { label: string; correct: number; total: number } | undefined,
  mode: string,
): string {
  if (mode === 'diagnostic') {
    return 'Your profile is built. The numbers below are a starting position, not a verdict — every set from here refines them.';
  }
  if (!weakest) return 'A clean set.';
  if (weakest.correct === weakest.total) {
    return `Nothing in this set separated you: ${accuracy}% with no micro-skill standing out as weak. The next set will run harder.`;
  }
  return `The pattern in this set sits in ${weakest.label.toLowerCase()} — ${weakest.correct} of ${weakest.total}. That is more useful than the percentage.`;
}
