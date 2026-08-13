import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { grammarPoints, mistakes } from '@/lib/db/schema';
import { GrammarPoint } from '@/components/grammar/GrammarPoint';

export const metadata: Metadata = { title: 'Grammar' };
export const dynamic = 'force-dynamic';

export default async function GrammarPage() {
  const session = await requireSession();

  const points = db.select().from(grammarPoints).orderBy(grammarPoints.level).all();

  const yourErrors = db
    .select()
    .from(mistakes)
    .where(and(eq(mistakes.userId, session.userId), eq(mistakes.orgId, session.orgId)))
    .all();

  const errorCounts = new Map<string, number>();
  for (const mistake of yourErrors) {
    if (mistake.resolvedAt) continue;
    errorCounts.set(mistake.errorCode, (errorCounts.get(mistake.errorCode) ?? 0) + mistake.occurrences);
  }

  const yours = points.filter((p) => errorCounts.has(p.errorCode));
  const rest = points.filter((p) => !errorCounts.has(p.errorCode));

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Grammar</p>
          <h1>Only the patterns that cost marks</h1>
          <p className="muted measure-wide">
            Each point here corresponds to a pattern Meridian can actually detect in your writing and speaking. A
            rule with no feedback loop is a page in a book; these come back as scheduled retrieval when you make
            them.
          </p>
        </div>
      </header>

      {yours.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Found in your own work
            </h2>
            <p className="tiny faint">Ranked by how often</p>
          </div>
          <div className="stack stack-5">
            {yours
              .sort((a, b) => (errorCounts.get(b.errorCode) ?? 0) - (errorCounts.get(a.errorCode) ?? 0))
              .map((point) => (
                <GrammarPoint
                  key={point.id}
                  slug={point.slug}
                  title={point.title}
                  explanation={point.explanation}
                  contrasts={JSON.parse(point.contrasts)}
                  drills={JSON.parse(point.drills)}
                  level={point.level}
                  occurrences={errorCounts.get(point.errorCode) ?? 0}
                />
              ))}
          </div>
        </section>
      ) : (
        <div className="empty" style={{ marginBottom: 'var(--s6)' }}>
          <h3>Nothing flagged in your work yet</h3>
          <p className="small">
            Submit a writing task or a recording and any patterns the checker finds will appear here first, with
            drills attached.
          </p>
        </div>
      )}

      <section>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {yours.length ? 'Everything else' : 'All patterns'}
          </h2>
          <p className="tiny faint">{points.length} points</p>
        </div>
        <div className="stack stack-5">
          {rest.map((point) => (
            <GrammarPoint
              key={point.id}
              slug={point.slug}
              title={point.title}
              explanation={point.explanation}
              contrasts={JSON.parse(point.contrasts)}
              drills={JSON.parse(point.drills)}
              level={point.level}
              occurrences={0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
