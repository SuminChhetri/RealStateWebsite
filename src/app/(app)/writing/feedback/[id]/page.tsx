import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { evaluations, writingSubmissions, writingTasks } from '@/lib/db/schema';
import type { CoachingPriority, DimensionResult } from '@/lib/engines/writing-eval';
import type { UsageFinding } from '@/lib/engines/usage-rules';
import { EstimateFootnote } from '@/components/Level';
import { AnnotatedText } from '@/components/writing/AnnotatedText';
import '../../writing.css';

export const metadata: Metadata = { title: 'Writing feedback' };
export const dynamic = 'force-dynamic';

const LABELS: Record<string, string> = {
  'writing.task_fulfilment': 'Task fulfilment',
  'writing.development': 'Development',
  'writing.organisation': 'Organisation',
  'writing.coherence': 'Coherence',
  'writing.register': 'Register',
  'writing.lexical_range': 'Vocabulary range',
  'writing.grammar_accuracy': 'Accuracy',
  'writing.sentence_variety': 'Sentence variety',
  'writing.concision': 'Concision',
  'writing.exam_pacing': 'Pacing',
};

export default async function WritingFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  const row = db
    .select({
      submission: writingSubmissions,
      task: writingTasks,
      evaluation: evaluations,
    })
    .from(writingSubmissions)
    .innerJoin(writingTasks, eq(writingTasks.id, writingSubmissions.taskId))
    .leftJoin(
      evaluations,
      and(eq(evaluations.submissionId, writingSubmissions.id), eq(evaluations.submissionType, 'writing')),
    )
    .where(
      and(
        eq(writingSubmissions.id, id),
        eq(writingSubmissions.userId, session.userId),
        eq(writingSubmissions.orgId, session.orgId),
      ),
    )
    .get();

  if (!row || !row.evaluation) notFound();

  const dimensions = JSON.parse(row.evaluation.dimensions) as DimensionResult[];
  const coaching = JSON.parse(row.evaluation.coaching) as {
    headline: string;
    strengths: string[];
    priorities: CoachingPriority[];
  };
  const findingsPayload = JSON.parse(row.evaluation.findings) as {
    usage: UsageFinding[];
    requirementCoverage: { requirement: string; covered: boolean; evidence: string | null }[];
    metrics: Record<string, number | string>;
  };
  const limitations = JSON.parse(row.evaluation.limitations) as string[];

  const uncovered = findingsPayload.requirementCoverage.filter((r) => !r.covered);

  return (
    <div className="page-narrow">
      <header className="page-header" data-skill="writing">
        <div className="stack stack-3">
          <p className="eyebrow row-tight">
            <span className="skill-mark" aria-hidden />
            {row.task.title}
          </p>
          <h1 className="measure-wide" style={{ fontSize: '1.6rem' }}>
            {coaching.headline}
          </h1>
          <div className="row-tight wrap">
            <span className="badge badge-accent numeric">
              CLB {row.evaluation.estimatedLevel.toFixed(1)} ± {row.evaluation.levelSe.toFixed(1)}
            </span>
            <span className="badge numeric">{findingsPayload.metrics.wordCount} words</span>
            <span className="badge numeric">
              {formatDuration(Number(findingsPayload.metrics.elapsedSeconds ?? 0))}
            </span>
          </div>
          <EstimateFootnote />
        </div>
      </header>

      {/* --- Required content coverage: the ceiling check --- */}
      <section className="panel" style={{ marginBottom: 'var(--s6)' }}>
        <div className="stack stack-4">
          <div className="row-between">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Required content
            </h2>
            <span className={`badge ${uncovered.length ? 'badge-critical' : 'badge-positive'}`}>
              {findingsPayload.requirementCoverage.length - uncovered.length} of{' '}
              {findingsPayload.requirementCoverage.length}
            </span>
          </div>
          <ul className="stack stack-3" style={{ listStyle: 'none', padding: 0 }}>
            {findingsPayload.requirementCoverage.map((item, i) => (
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
                <div className="stack stack-1">
                  <p className="small">{item.requirement}</p>
                  {item.evidence ? (
                    <p className="tiny faint">Found: “{truncate(item.evidence, 110)}”</p>
                  ) : (
                    <p className="tiny" style={{ color: 'var(--critical)' }}>
                      Not addressed — this caps the whole response.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="tiny faint">
            Coverage is detected by comparing the content words of each requirement against your text. If you
            addressed a point in wording the check missed, it will show as uncovered — read it as a prompt to
            check, not a verdict.
          </p>
        </div>
      </section>

      {/* --- Priorities --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Three things to change
          </h2>
          <p className="tiny faint">Ranked by what is costing you most</p>
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
                      From your text
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

      {/* --- Annotated response --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Your response, annotated
          </h2>
          <p className="tiny faint">
            {findingsPayload.usage.length} pattern{findingsPayload.usage.length === 1 ? '' : 's'} flagged
          </p>
        </div>
        <div className="panel">
          <AnnotatedText text={row.submission.text} findings={findingsPayload.usage} />
        </div>
      </section>

      {/* --- What a strong response does --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="panel-quiet stack stack-3">
          <p className="eyebrow">What a strong response to this prompt does</p>
          <p className="small measure-wide">{row.task.modelNotes}</p>
          <p className="tiny faint">
            These are the moves, not a model answer. A model answer teaches copying, and copied structure is what
            holds responses at CLB 8.
          </p>
        </div>
      </section>

      {/* --- Limitations --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <details className="panel-quiet">
          <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
            What this analysis cannot tell you
          </summary>
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
        <Link className="btn btn-primary" href={`/writing/${row.task.slug}`}>
          Rewrite this task
        </Link>
        <Link className="btn" href="/writing">
          Another task
        </Link>
        <Link className="btn" href="/home">
          Back to today
        </Link>
      </div>
    </div>
  );
}

function truncate(text: string, n: number): string {
  return text.length <= n ? text : `${text.slice(0, n - 1).trimEnd()}…`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
