import type { Metadata } from 'next';
import Link from 'next/link';
import { and, eq, inArray } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { grammarPoints, mistakes, questions, reviewCards, vocabularyEntries } from '@/lib/db/schema';
import { startReview } from '@/lib/practice/actions';
import { retrievability } from '@/lib/engines/srs';
import { tryMicroSkill } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Review' };
export const dynamic = 'force-dynamic';

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ empty?: string }> }) {
  const query = await searchParams;
  const session = await requireSession();
  const now = Math.floor(Date.now() / 1000);

  const cards = (await db
    .select()
    .from(reviewCards)
    .where(and(eq(reviewCards.userId, session.userId), eq(reviewCards.orgId, session.orgId)))
    );

  const due = cards.filter((c) => c.dueAt <= now);
  const upcoming = cards
    .filter((c) => c.dueAt > now)
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, 8);

  const dueQuestions = due.filter((c) => c.kind === 'question');
  const dueGrammar = due.filter((c) => c.kind === 'grammar');
  const dueVocabulary = due.filter((c) => c.kind === 'vocabulary');

  const questionMeta = dueQuestions.length
    ? (await db
        .select({ id: questions.id, microSkill: questions.microSkill, skill: questions.skill })
        .from(questions)
        .where(inArray(questions.id, dueQuestions.map((c) => c.refId)))
        )
    : [];

  const grammarMeta = dueGrammar.length
    ? (await db
        .select({ slug: grammarPoints.slug, title: grammarPoints.title })
        .from(grammarPoints)
        .where(inArray(grammarPoints.slug, dueGrammar.map((c) => c.refId)))
        )
    : [];

  const openMistakes = (await db
    .select()
    .from(mistakes)
    .where(and(eq(mistakes.userId, session.userId), eq(mistakes.orgId, session.orgId)))
    )
    .filter((m) => !m.resolvedAt);

  const vocabularyTotal = (await db.select({ id: vocabularyEntries.id }).from(vocabularyEntries)).length;

  const bySkill = new Map<string, number>();
  for (const meta of questionMeta) bySkill.set(meta.skill, (bySkill.get(meta.skill) ?? 0) + 1);

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Scheduled retrieval</p>
          <h1>
            {due.length ? `${due.length} item${due.length === 1 ? '' : 's'} due today` : 'Nothing due today'}
          </h1>
          <p className="muted measure-wide">
            Items come back on the day you are most likely to be about to forget them. Recalling something at that
            moment is what moves it into durable memory — reviewing it earlier feels productive and does much less.
          </p>
        </div>
      </header>

      {query.empty ? (
        <p className="small muted" style={{ marginBottom: 'var(--s5)' }}>
          Nothing was due, so no set was built.
        </p>
      ) : null}

      {due.length ? (
        <section className="panel" style={{ marginBottom: 'var(--s6)' }}>
          <div className="stack stack-4">
            <div className="grid grid-3">
              <div className="stack stack-1">
                <p className="eyebrow">Practice items</p>
                <p className="numeric" style={{ fontSize: '1.5rem' }}>
                  {dueQuestions.length}
                </p>
                <p className="tiny faint">
                  {[...bySkill.entries()].map(([skill, count]) => `${count} ${skill}`).join(' · ') || '—'}
                </p>
              </div>
              <div className="stack stack-1">
                <p className="eyebrow">Grammar patterns</p>
                <p className="numeric" style={{ fontSize: '1.5rem' }}>
                  {dueGrammar.length}
                </p>
                <p className="tiny faint">From your writing and speaking</p>
              </div>
              <div className="stack stack-1">
                <p className="eyebrow">Vocabulary</p>
                <p className="numeric" style={{ fontSize: '1.5rem' }}>
                  {dueVocabulary.length}
                </p>
                <p className="tiny faint">{vocabularyTotal} entries available</p>
              </div>
            </div>

            <div className="row wrap">
              {dueQuestions.length ? (
                <form action={startReview}>
                  <button className="btn btn-primary btn-lg" type="submit">
                    Start review · {Math.min(15, dueQuestions.length)} items
                  </button>
                </form>
              ) : null}
              {dueGrammar.length ? (
                <Link className="btn" href="/grammar">
                  Grammar drills
                </Link>
              ) : null}
              {dueVocabulary.length ? (
                <Link className="btn" href="/vocabulary">
                  Vocabulary
                </Link>
              ) : null}
            </div>

            <p className="tiny faint">
              Review sets are untimed. The purpose is retrieval, not speed — the timed measurement happens in
              practice sets.
            </p>
          </div>
        </section>
      ) : (
        <div className="empty" style={{ marginBottom: 'var(--s6)' }}>
          <h3>Your queue is clear</h3>
          <p className="small">
            {cards.length
              ? `${cards.length} item${cards.length === 1 ? '' : 's'} are scheduled for later. Nothing is gained by pulling them forward — the interval is the mechanism.`
              : 'Nothing is scheduled yet. Items enter this queue when you answer them incorrectly or unusually slowly, and when the writing analyser finds a repeated pattern.'}
          </p>
        </div>
      )}

      {dueGrammar.length ? (
        <section style={{ marginBottom: 'var(--s6)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Grammar patterns due
            </h2>
          </div>
          <ul className="stack stack-2" style={{ listStyle: 'none', padding: 0 }}>
            {grammarMeta.map((point) => (
              <li key={point.slug}>
                <Link className="panel-quiet" href={`/grammar#${point.slug}`} style={{ display: 'block', textDecoration: 'none', padding: 'var(--s4)' }}>
                  <p style={{ fontWeight: 500 }}>{point.title}</p>
                  <p className="tiny faint">Flagged in your own writing</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {upcoming.length ? (
        <section style={{ marginBottom: 'var(--s6)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Coming up
            </h2>
            <p className="tiny faint">Predicted recall at the scheduled date</p>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Due</th>
                  <th scope="col">Interval</th>
                  <th scope="col">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((card) => {
                  const meta = questionMeta.find((q) => q.id === card.refId);
                  const days = Math.max(0, Math.round((card.dueAt - now) / 86400));
                  const elapsed = card.lastReviewedAt ? (card.dueAt - card.lastReviewedAt) / 86400 : 0;
                  return (
                    <tr key={card.id}>
                      <th scope="row" style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.875rem', color: 'var(--ink)', letterSpacing: 0 }}>
                        {meta ? (tryMicroSkill(meta.microSkill)?.label ?? meta.microSkill) : `${card.kind} · ${card.refId}`}
                      </th>
                      <td className="num">{days === 0 ? 'today' : `in ${days}d`}</td>
                      <td className="num">{elapsed ? `${Math.round(elapsed)}d` : '—'}</td>
                      <td className="num">
                        {card.reps}
                        {card.lapses ? ` (${card.lapses} lapse${card.lapses === 1 ? '' : 's'})` : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="tiny faint" style={{ marginTop: 'var(--s3)' }}>
            Predicted recall today for the nearest item:{' '}
            {upcoming[0]?.lastReviewedAt
              ? `${Math.round(retrievability((now - upcoming[0].lastReviewedAt) / 86400, upcoming[0].stability) * 100)}%`
              : '—'}
            . The scheduler aims to bring each item back at 90%.
          </p>
        </section>
      ) : null}

      {openMistakes.length ? (
        <section>
          <div className="panel-quiet row-between wrap">
            <div className="stack stack-2">
              <p style={{ fontWeight: 500 }}>
                {openMistakes.length} unresolved mistake{openMistakes.length === 1 ? '' : 's'}
              </p>
              <p className="small muted measure-wide">
                Reviews rehearse specific items. The mistake bank works on the pattern behind them.
              </p>
            </div>
            <Link className="btn" href="/mistakes">
              Open the bank
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
