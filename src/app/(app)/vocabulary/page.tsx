import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { vocabularyEntries } from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { VocabularyTrainer } from '@/components/vocabulary/VocabularyTrainer';

export const metadata: Metadata = { title: 'Vocabulary' };
export const dynamic = 'force-dynamic';

export default async function VocabularyPage() {
  const session = await requireSession();
  const profile = await getProfile(session.userId, session.orgId);

  const entries = (await db.select().from(vocabularyEntries));

  // Introduce words at and slightly above the learner's level: below it they
  // teach nothing, far above it they are memorised and never used.
  const floor = Math.max(7, Math.round(profile.readiness.overall || profile.targetLevel - 2));
  const relevant = entries
    .filter((e) => e.level >= floor - 1 && e.level <= Math.min(12, floor + 2))
    .sort((a, b) => a.level - b.level);

  const byTopic = new Map<string, typeof entries>();
  for (const entry of entries) {
    const list = byTopic.get(entry.topic) ?? [];
    list.push(entry);
    byTopic.set(entry.topic, list);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Vocabulary</p>
          <h1>Words that earn points</h1>
          <p className="muted measure-wide">
            Every entry here is a word that changes a response for the better in a specific task — not a word that
            sounds advanced. Rare vocabulary used imprecisely lowers a score; mid-frequency vocabulary used exactly
            raises it.
          </p>
        </div>
      </header>

      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Retrieval practice
          </h2>
          <p className="tiny faint">
            {relevant.length} entries at your level (CLB {floor}–{Math.min(12, floor + 2)})
          </p>
        </div>
        <VocabularyTrainer
          entries={relevant.slice(0, 40).map((e) => ({
            id: e.id,
            headword: e.headword,
            pos: e.pos,
            definition: e.definition,
            example: e.example,
            collocations: JSON.parse(e.collocations) as string[],
            usefulFor: JSON.parse(e.usefulFor) as string[],
            pitfall: e.pitfall,
            register: e.register,
            level: e.level,
          }))}
        />
      </section>

      <section>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            The whole set, by topic
          </h2>
          <p className="tiny faint">{entries.length} entries</p>
        </div>

        <div className="stack stack-5">
          {[...byTopic.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .map(([topic, list]) => (
              <details key={topic} className="panel-quiet">
                <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
                  {topic.replace(/^\w/, (c) => c.toUpperCase())}{' '}
                  <span className="tiny faint numeric">({list.length})</span>
                </summary>
                <div className="table-wrap" style={{ marginTop: 'var(--s4)' }}>
                  <table className="data">
                    <thead>
                      <tr>
                        <th scope="col">Word</th>
                        <th scope="col">Meaning</th>
                        <th scope="col">In use</th>
                        <th scope="col">CLB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((entry) => (
                        <tr key={entry.id}>
                          <th
                            scope="row"
                            style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.875rem', color: 'var(--ink)', letterSpacing: 0 }}
                          >
                            {entry.headword}
                            <span className="tiny faint" style={{ fontWeight: 400 }}>
                              {' '}
                              {entry.pos}
                            </span>
                          </th>
                          <td className="small">{entry.definition}</td>
                          <td className="small muted" style={{ fontFamily: 'var(--font-reading)' }}>
                            {entry.example}
                          </td>
                          <td className="num">{entry.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
        </div>
      </section>
    </div>
  );
}
