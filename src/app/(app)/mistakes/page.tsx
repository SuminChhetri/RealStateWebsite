import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { grammarPoints, mistakes } from '@/lib/db/schema';
import { SKILL_LABELS, tryMicroSkill, type Domain } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Mistakes' };
export const dynamic = 'force-dynamic';

export default async function MistakesPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const query = await searchParams;
  const session = await requireSession();

  const rows = db
    .select()
    .from(mistakes)
    .where(and(eq(mistakes.userId, session.userId), eq(mistakes.orgId, session.orgId)))
    .orderBy(desc(mistakes.occurrences), desc(mistakes.lastSeenAt))
    .all();

  const open = rows.filter((r) => !r.resolvedAt);
  const resolved = rows.filter((r) => r.resolvedAt);
  const recurring = open.filter((r) => r.occurrences >= 2);

  const grammar = db.select().from(grammarPoints).all();

  const bySkill = new Map<string, typeof open>();
  for (const row of open) {
    const list = bySkill.get(row.skill) ?? [];
    list.push(row);
    bySkill.set(row.skill, list);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Your mistake bank</p>
          <h1>
            {open.length ? `${open.length} pattern${open.length === 1 ? '' : 's'} still open` : 'Nothing open'}
          </h1>
          <p className="muted measure-wide">
            A mistake stays here until you have answered three later items that force the same decision correctly.
            One right answer is a coin flip; three is evidence. {resolved.length ? `${resolved.length} closed so far.` : ''}
          </p>
        </div>
      </header>

      {recurring.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Your most repeated mistakes
            </h2>
            <p className="tiny faint">These cost the most</p>
          </div>
          <ol className="stack stack-4" style={{ listStyle: 'none', padding: 0 }}>
            {recurring.slice(0, 5).map((row) => {
              const meta = tryMicroSkill(row.microSkill);
              const point = grammar.find((g) => g.errorCode === row.errorCode);
              const focused = query.focus === row.errorCode;
              return (
                <li
                  key={row.id}
                  className="panel"
                  data-skill={row.skill}
                  style={{
                    borderLeft: '3px solid var(--skill, var(--critical))',
                    outline: focused ? '2px solid var(--accent)' : undefined,
                  }}
                >
                  <div className="stack stack-3">
                    <div className="row-between wrap">
                      <div className="row-tight">
                        <span className="badge badge-critical numeric">×{row.occurrences}</span>
                        <span className="badge">{SKILL_LABELS[row.skill as Domain] ?? row.skill}</span>
                        {meta ? <span className="badge">{meta.label}</span> : null}
                      </div>
                      <span className="tiny faint">
                        {row.provedStreak > 0 ? `${row.provedStreak}/3 proved` : 'Not yet retested'}
                      </span>
                    </div>

                    <p style={{ fontWeight: 500 }}>{row.summary}</p>
                    {row.detail ? <p className="small muted measure-wide">{row.detail}</p> : null}

                    {meta ? (
                      <p className="small inset">
                        <span className="eyebrow" style={{ display: 'block', marginBottom: 'var(--s1)' }}>
                          What separates a right answer here
                        </span>
                        {meta.discriminator}
                      </p>
                    ) : null}

                    <div className="row wrap">
                      {row.skill === 'reading' || row.skill === 'listening' ? (
                        <Link
                          className="btn btn-sm btn-primary"
                          href={`/practice/${row.skill}?micro=${encodeURIComponent(row.microSkill)}`}
                        >
                          Retest this pattern
                        </Link>
                      ) : null}
                      {point ? (
                        <Link className="btn btn-sm" href={`/grammar#${point.slug}`}>
                          Drill: {point.title.toLowerCase()}
                        </Link>
                      ) : null}
                      {row.skill === 'writing' ? (
                        <Link className="btn btn-sm" href="/writing">
                          Write again
                        </Link>
                      ) : null}
                      {row.skill === 'speaking' ? (
                        <Link className="btn btn-sm" href="/speaking">
                          Record again
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {open.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Everything open, by skill
            </h2>
          </div>
          <div className="grid grid-2">
            {[...bySkill.entries()].map(([skill, list]) => (
              <div key={skill} className="panel-quiet" data-skill={skill}>
                <div className="stack stack-3">
                  <h3 className="row-tight" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    <span className="skill-mark" aria-hidden />
                    {SKILL_LABELS[skill as Domain] ?? skill}
                    <span className="tiny faint numeric">({list.length})</span>
                  </h3>
                  <ul className="stack stack-3" style={{ listStyle: 'none', padding: 0 }}>
                    {list.slice(0, 6).map((row) => (
                      <li key={row.id} className="stack stack-1">
                        <div className="row-between">
                          <span className="small">{tryMicroSkill(row.microSkill)?.label ?? row.microSkill}</span>
                          <span className="tiny faint numeric">×{row.occurrences}</span>
                        </div>
                        <p className="tiny muted">{truncate(row.summary, 110)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="empty" style={{ marginBottom: 'var(--s6)' }}>
          <h3>Nothing recorded yet</h3>
          <p className="small">
            Mistakes are captured automatically: a wrong answer in practice, a usage pattern in your writing, a
            dimension well below target in a recording. Each one is stored with the reason, not just the item.
          </p>
        </div>
      )}

      {resolved.length ? (
        <section>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Closed</h2>
            <p className="tiny faint">Proved three times</p>
          </div>
          <ul className="row wrap" style={{ listStyle: 'none', padding: 0, gap: 'var(--s2)' }}>
            {resolved.map((row) => (
              <li key={row.id}>
                <span className="badge badge-positive">
                  {tryMicroSkill(row.microSkill)?.label ?? row.microSkill}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function truncate(text: string, n: number): string {
  return text.length <= n ? text : `${text.slice(0, n - 1).trimEnd()}…`;
}
