import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { checkFeature, requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { evaluations, reviewRequests, speakingSubmissions, speakingTasks } from '@/lib/db/schema';
import type { CoachingPriority, DimensionResult } from '@/lib/engines/writing-eval';
import { EstimateFootnote } from '@/components/Level';
import { PauseTimeline } from '@/components/speaking/PauseTimeline';
import { ReviewRequest } from '@/components/ReviewRequest';
import { SelfReview } from '@/components/SelfReview';
import { hasReviewerOtherThan } from '@/lib/practice/review-access';
import { buildSelfReview } from '@/lib/practice/self-review';
import { getProfile } from '@/lib/learner/profile';
import '../../../writing/writing.css';

export const metadata: Metadata = { title: 'Speaking feedback' };
export const dynamic = 'force-dynamic';

const LABELS: Record<string, string> = {
  'speaking.task_response': 'Answering the task',
  'speaking.structure': 'Structure',
  'speaking.development': 'Depth of support',
  'speaking.fluency': 'Fluency',
  'speaking.pacing': 'Time use',
  'speaking.lexical_range': 'Vocabulary range',
  'speaking.grammar_control': 'Grammatical control',
  'speaking.coherence': 'Coherence',
  'speaking.filler_control': 'Filler control',
};

export default async function SpeakingFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  const row = (await db
    .select({ submission: speakingSubmissions, task: speakingTasks, evaluation: evaluations })
    .from(speakingSubmissions)
    .innerJoin(speakingTasks, eq(speakingTasks.id, speakingSubmissions.taskId))
    .leftJoin(
      evaluations,
      and(eq(evaluations.submissionId, speakingSubmissions.id), eq(evaluations.submissionType, 'speaking')),
    )
    .where(
      and(
        eq(speakingSubmissions.id, id),
        eq(speakingSubmissions.userId, session.userId),
        eq(speakingSubmissions.orgId, session.orgId),
      ),
    )
    .limit(1))[0];

  if (!row || !row.evaluation) notFound();

  const dimensions = JSON.parse(row.evaluation.dimensions) as DimensionResult[];
  const coaching = JSON.parse(row.evaluation.coaching) as {
    headline: string;
    strengths: string[];
    priorities: CoachingPriority[];
  };
  const findings = JSON.parse(row.evaluation.findings) as {
    criteriaCoverage: { criterion: string; covered: boolean }[];
    metrics: Record<string, number | string>;
    transcriptQuality: string;
  };
  const limitations = JSON.parse(row.evaluation.limitations) as string[];
  const envelope = row.submission.timeline
    ? (JSON.parse(row.submission.timeline) as { tMs: number; rms: number }[])
    : [];

  // Human review, where there is a human. Speech is where the rule-based
  // analysis is thinnest — it can measure pace and pausing but cannot hear
  // whether you sound natural — so the route to a person matters most here, and
  // so does not pretending one exists when none does.
  const reviewGate = await checkFeature(session, 'teacher_review');
  const reviewerAvailable = await hasReviewerOtherThan(session.orgId, session.userId);
  const [review] = reviewGate.allowed
    ? await db
        .select()
        .from(reviewRequests)
        .where(
          and(
            eq(reviewRequests.submissionType, 'speaking'),
            eq(reviewRequests.submissionId, id),
            eq(reviewRequests.orgId, session.orgId),
          ),
        )
        .limit(1)
    : [];

  const profile = await getProfile(session.userId, session.orgId);
  const selfReview = buildSelfReview({
    kind: 'speaking',
    coverage: findings.criteriaCoverage.map((c) => ({ requirement: c.criterion, covered: c.covered })),
    dimensions: dimensions.map((d) => ({
      label: LABELS[d.microSkill] ?? d.microSkill,
      level: d.level,
      note: d.note,
    })),
    priorities: coaching.priorities.map((p) => ({ title: p.title, how: p.how })),
    modelNotes: row.task.modelNotes,
    estimatedLevel: row.evaluation.estimatedLevel,
    targetLevel: profile.targetLevel,
  });

  return (
    <div className="page-narrow">
      <header className="page-header" data-skill="speaking">
        <div className="stack stack-3">
          <p className="eyebrow row-tight">
            <span className="skill-mark" aria-hidden />
            Task {row.task.taskNumber} · {row.task.title}
          </p>
          <h1 className="measure-wide" style={{ fontSize: '1.6rem' }}>
            {coaching.headline}
          </h1>
          <div className="row-tight wrap">
            <span className="badge badge-accent numeric">
              CLB {row.evaluation.estimatedLevel.toFixed(1)} ± {row.evaluation.levelSe.toFixed(1)}
            </span>
            <span className="badge numeric">{findings.metrics.durationSeconds}s of {row.task.speakSeconds}s</span>
            {findings.metrics.wordsPerMinute ? (
              <span className="badge numeric">{findings.metrics.wordsPerMinute} wpm</span>
            ) : null}
            <span className="badge">
              {findings.transcriptQuality === 'asr'
                ? 'Recognised transcript'
                : findings.transcriptQuality === 'manual'
                  ? 'Typed transcript'
                  : 'No transcript'}
            </span>
          </div>
          <EstimateFootnote />
        </div>
      </header>

      {row.submission.audioKey ? (
        <section className="panel" style={{ marginBottom: 'var(--s6)' }}>
          <div className="stack stack-4">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Listen back
            </h2>
            <audio controls src={`/api/speaking/audio/${row.submission.id}`} style={{ width: '100%' }}>
              Your browser does not support audio playback.
            </audio>
            {envelope.length > 8 ? (
              <PauseTimeline
                envelope={envelope}
                durationMs={row.submission.durationMs}
                speakSeconds={row.task.speakSeconds}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* --- Did the response do the job? --- */}
      <section className="panel" style={{ marginBottom: 'var(--s6)' }}>
        <div className="stack stack-4">
          <div className="row-between">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              The moves this task asks for
            </h2>
            <span
              className={`badge ${
                findings.criteriaCoverage.every((c) => c.covered) ? 'badge-positive' : 'badge-caution'
              }`}
            >
              {findings.criteriaCoverage.filter((c) => c.covered).length} of {findings.criteriaCoverage.length}
            </span>
          </div>
          <ul className="stack stack-3" style={{ listStyle: 'none', padding: 0 }}>
            {findings.criteriaCoverage.map((item, i) => (
              <li key={i} className="row" style={{ alignItems: 'flex-start' }}>
                <span
                  aria-hidden
                  style={{
                    marginTop: '0.35rem',
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    flexShrink: 0,
                    background: item.covered ? 'var(--positive)' : 'var(--critical)',
                  }}
                />
                <p className="small">{item.criterion}</p>
              </li>
            ))}
          </ul>
          <p className="tiny faint">
            Detected by comparing your transcript against the moves this task rewards. A move you made in very
            different wording may show as missing — treat it as a prompt to check the recording, not a verdict.
          </p>
        </div>
      </section>

      {/* --- Priorities --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            What to change before the next recording
          </h2>
        </div>
        <ol className="stack stack-4" style={{ listStyle: 'none', padding: 0 }}>
          {coaching.priorities.map((priority, i) => (
            <li key={priority.microSkill} className="panel-quiet">
              <div className="stack stack-3">
                <div className="row-tight">
                  <span className="badge badge-accent numeric">{i + 1}</span>
                  <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    {priority.title}
                  </h3>
                </div>
                <p className="small muted">
                  <strong style={{ color: 'var(--ink)' }}>Why it costs you: </strong>
                  {priority.why}
                </p>
                <p className="small">
                  <strong>Do this: </strong>
                  {priority.how}
                </p>
                {priority.fromYourText ? (
                  <p className="small inset">
                    <span className="eyebrow" style={{ display: 'block', marginBottom: 'var(--s1)' }}>
                      From your response
                    </span>
                    {priority.fromYourText}
                  </p>
                ) : null}
                {priority.drill ? (
                  <Link
                    className="btn btn-sm"
                    href={priority.drill.kind === 'lesson' ? `/library/${priority.drill.ref}` : `/${priority.drill.ref}`}
                  >
                    {priority.drill.label}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* --- Dimensions --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Every dimension, with the evidence
          </h2>
        </div>
        <div className="divide">
          {[...dimensions]
            .sort((a, b) => a.level - b.level)
            .map((dimension) => (
              <div className="dimension-row" key={dimension.microSkill}>
                <div className="stack stack-1">
                  <p className="small" style={{ fontWeight: 600 }}>
                    {LABELS[dimension.microSkill] ?? dimension.microSkill}
                  </p>
                  <p className="numeric small muted">CLB {dimension.level.toFixed(1)}</p>
                </div>
                <div>
                  <div className="dimension-bar" aria-hidden>
                    <span style={{ width: `${Math.max(4, ((dimension.level - 4) / 8) * 100)}%` }} />
                  </div>
                </div>
                <div className="stack stack-2">
                  <ul className="stack stack-1" style={{ listStyle: 'none', padding: 0 }}>
                    {dimension.evidence.map((line, i) => (
                      <li key={i} className="tiny muted">
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="small">{dimension.note}</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* --- Transcript --- */}
      {row.submission.transcript ? (
        <section style={{ marginBottom: 'var(--s6)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              What you said
            </h2>
          </div>
          <div className="panel">
            <p className="passage" style={{ maxWidth: '100%' }}>
              {row.submission.transcript}
            </p>
          </div>
        </section>
      ) : null}

      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="panel-quiet stack stack-3">
          <p className="eyebrow">What a strong response to this task does</p>
          <p className="small measure-wide">{row.task.modelNotes}</p>
        </div>
      </section>

      {/* --- Second pass: a person where there is one, a protocol where there is not --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {reviewGate.allowed && reviewerAvailable ? 'From a teacher' : 'The second pass'}
          </h2>
          <p className="tiny faint">
            {reviewGate.allowed && reviewerAvailable
              ? 'Someone who can hear it, not only measure it'
              : 'What the analyser cannot hear, and you can'}
          </p>
        </div>

        {reviewGate.allowed && (reviewerAvailable || review) ? (
          review?.status === 'returned' ? (
            <article className="panel" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className="stack stack-3">
                {review.reviewerLevel !== null ? (
                  <p className="small">
                    <strong>Their band: CLB {review.reviewerLevel.toFixed(1)}</strong>{' '}
                    <span className="muted">
                      (the analyser above said {row.evaluation.estimatedLevel.toFixed(1)} — these are shown
                      separately on purpose; a human judgement and a rule-based estimate are different kinds of
                      claim, and averaging them would hide both)
                    </span>
                  </p>
                ) : null}
                <p className="prose" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>
                  {review.feedback}
                </p>
              </div>
            </article>
          ) : review ? (
            <div className="stack stack-4">
              <p className="notice notice-caution">
                {review.status === 'claimed'
                  ? 'A teacher has picked this up and is listening to it.'
                  : reviewerAvailable
                    ? 'Waiting for a teacher. The automated analysis above does not wait for it.'
                    : 'This was sent when someone was here to hear it, and nobody is now. Rather than leave you waiting on an answer that may not come, the self-review below is the same work you would be asked to do anyway.'}
              </p>
              {review.status === 'requested' && !reviewerAvailable ? (
                <SelfReview
                  review={selfReview}
                  retryHref={`/speaking/${row.task.slug}`}
                  retryLabel="Record this task again"
                />
              ) : null}
            </div>
          ) : row.submission.audioKey ? (
            <ReviewRequest submissionType="speaking" submissionId={id} />
          ) : (
            <p className="notice notice-caution">
              No audio was stored for this response, so there is nothing for a teacher to listen to. Record it
              again to ask for a human review.
            </p>
          )
        ) : (
          <SelfReview
            review={selfReview}
            retryHref={`/speaking/${row.task.slug}`}
            retryLabel="Record this task again"
          />
        )}
      </section>

      <section style={{ marginBottom: 'var(--s6)' }}>
        <details className="panel-quiet">
          <summary style={{ cursor: 'pointer', fontWeight: 500 }}>What this analysis cannot tell you</summary>
          <ul className="stack stack-2" style={{ marginTop: 'var(--s4)', paddingLeft: '1.1rem' }}>
            {limitations.map((limitation, i) => (
              <li key={i} className="small muted">
                {limitation}
              </li>
            ))}
            <li className="small muted">
              Engine: {row.evaluation.engine} v{row.evaluation.engineVersion}.
            </li>
          </ul>
        </details>
      </section>

      <div className="row wrap">
        <Link className="btn btn-primary" href={`/speaking/${row.task.slug}`}>
          Record this task again
        </Link>
        <Link className="btn" href="/speaking">
          Another task
        </Link>
        <Link className="btn" href="/home">
          Back to today
        </Link>
      </div>
    </div>
  );
}
