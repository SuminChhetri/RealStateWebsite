import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, sql } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { attempts, speakingSubmissions, writingSubmissions } from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { startPractice } from '@/lib/practice/actions';
import { poolStatus } from '@/lib/practice/replenish';
import { SECTION_BLUEPRINT, SKILL_LABELS, TEST_SECTION_ORDER } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Mock tests' };
export const dynamic = 'force-dynamic';

/**
 * A full simulation runs section by section in the published order, at the
 * published timings. It is not stitched into one three-hour page because a
 * single browser tab held open for three hours is a worse experience and a
 * worse rehearsal than four sections taken in sequence with the clock running
 * inside each one.
 */
export default async function MockTestsPage() {
  const session = await requireSession();
  const profile = await getProfile(session.userId, session.orgId);
  const dayAgo = Math.floor(Date.now() / 1000) - 86400;

  const recentSections = (await db
    .select({ skill: attempts.skill, completedAt: attempts.completedAt, id: attempts.id, rawScore: attempts.rawScore, maxScore: attempts.maxScore })
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, session.userId),
        eq(attempts.orgId, session.orgId),
        eq(attempts.mode, 'section'),
        sql`${attempts.completedAt} is not null`,
        sql`${attempts.startedAt} > ${dayAgo}`,
      ),
    )
    .orderBy(desc(attempts.startedAt))
    );

  const recentWriting = (await db
    .select({ count: sql<number>`count(*)::int` })
    .from(writingSubmissions)
    .where(
      and(
        eq(writingSubmissions.userId, session.userId),
        eq(writingSubmissions.orgId, session.orgId),
        sql`${writingSubmissions.submittedAt} > ${dayAgo}`,
      ),
    )
    .limit(1))[0]?.count ?? 0;

  const recentSpeaking = (await db
    .select({ count: sql<number>`count(*)::int` })
    .from(speakingSubmissions)
    .where(
      and(
        eq(speakingSubmissions.userId, session.userId),
        eq(speakingSubmissions.orgId, session.orgId),
        sql`${speakingSubmissions.submittedAt} > ${dayAgo}`,
      ),
    )
    .limit(1))[0]?.count ?? 0;

  const [readingPool, listeningPool] = await Promise.all([
    poolStatus(session.userId, session.orgId, 'reading'),
    poolStatus(session.userId, session.orgId, 'listening'),
  ]);

  const done = {
    listening: recentSections.some((s) => s.skill === 'listening'),
    reading: recentSections.some((s) => s.skill === 'reading'),
    writing: recentWriting >= 2,
    speaking: recentSpeaking >= 4,
  };
  const completed = Object.values(done).filter(Boolean).length;

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Full simulation</p>
          <h1>The whole test, in order, at the real timings</h1>
          <p className="muted measure-wide">
            Drills build skills. A simulation tests something drills cannot: whether you can still read carefully in
            the fourth part after fifty minutes of concentration, and whether your writing holds up after the
            listening section has already taken its toll.
          </p>
        </div>
      </header>

      {profile.daysToExam !== null && profile.daysToExam <= 21 ? (
        <section className="panel" style={{ marginBottom: 'var(--s6)', borderLeft: '3px solid var(--accent)' }}>
          <p className="small measure-wide">
            Your test is {profile.daysToExam} day{profile.daysToExam === 1 ? '' : 's'} away. At this range a full
            sitting is usually worth more than another set of drills — and it is worth taking at the same time of
            day as your booked appointment.
          </p>
        </section>
      ) : null}

      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Today’s sitting
          </h2>
          <p className="tiny faint">{completed} of 4 sections done in the last 24 hours</p>
        </div>

        <ol className="stack stack-3" style={{ listStyle: 'none', padding: 0 }}>
          {TEST_SECTION_ORDER.map((skill, index) => {
            const blueprint = SECTION_BLUEPRINT[skill];
            const isDone = done[skill];
            const section = recentSections.find((s) => s.skill === skill);
            return (
              <li key={skill} className="panel" data-skill={skill} style={{ borderLeft: '3px solid var(--skill)' }}>
                <div className="row-between wrap" style={{ alignItems: 'flex-start' }}>
                  <div className="stack stack-2">
                    <div className="row-tight">
                      <span className="badge numeric">{index + 1}</span>
                      <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                        {SKILL_LABELS[skill]}
                      </h3>
                      {isDone ? <span className="badge badge-positive">Done today</span> : null}
                    </div>
                    <p className="small muted">
                      {blueprint.parts.length} part{blueprint.parts.length === 1 ? '' : 's'} ·{' '}
                      {blueprint.itemCount} item{blueprint.itemCount === 1 ? '' : 's'} · about {blueprint.minutes}{' '}
                      minutes
                    </p>
                    {section ? (
                      <p className="tiny faint numeric">
                        Last: {section.rawScore}/{section.maxScore} ·{' '}
                        <Link href={`/session/${section.id}/results`}>feedback</Link>
                      </p>
                    ) : null}
                  </div>

                  <div className="row-tight">
                    {skill === 'reading' || skill === 'listening' ? (
                      <form action={startPractice}>
                        <input type="hidden" name="skill" value={skill} />
                        <input type="hidden" name="mode" value="section" />
                        <input type="hidden" name="count" value={Math.min(40, blueprint.itemCount)} />
                        <input type="hidden" name="timed" value="on" />
                        <button className={`btn ${isDone ? '' : 'btn-primary'}`} type="submit">
                          {isDone ? 'Take again' : 'Start section'}
                        </button>
                      </form>
                    ) : (
                      <Link className={`btn ${isDone ? '' : 'btn-primary'}`} href={`/${skill}`}>
                        {isDone ? 'Take again' : 'Start section'}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* --- What is actually left to take --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            How much material is left
          </h2>
          <p className="tiny faint">Take as many as you like — this is what you would be taking them from</p>
        </div>

        <div className="grid grid-2">
          {([
            ['reading', readingPool] as const,
            ['listening', listeningPool] as const,
          ]).map(([skill, pool]) => (
            <div key={skill} className="panel-quiet" data-skill={skill}>
              <div className="stack stack-3">
                <h3 className="row-tight" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  <span className="skill-mark" aria-hidden />
                  {SKILL_LABELS[skill]}
                </h3>
                <p className="small">
                  <strong className="numeric">{pool.unseen}</strong> item
                  {pool.unseen === 1 ? '' : 's'} you have not seen, of{' '}
                  <span className="numeric">{pool.total}</span>.
                </p>
                <p className="tiny faint">
                  {pool.authored} written by an author, {pool.generated} built by the item generator. More are
                  made automatically before you can run out, so this never ends.
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="tiny faint" style={{ marginTop: 'var(--s3)' }}>
          Generated items are marked as such wherever they appear. They come from structured data — timetables,
          service calls, the vocabulary corpus, the grammar rules — so their answers are computed rather than
          written, and they count slightly less toward your estimate than a reviewed authored item does.
        </p>
        <p className="tiny faint" style={{ marginTop: 'var(--s2)' }}>
          What is <em>not</em> generated: gist, tone, inference, and what a speaker&rsquo;s attitude tells you.
          Those need a judgement about how something was said, and every item testing them is hand-written.
        </p>
      </section>

      <section>
        <div className="panel-quiet stack stack-3">
          <p className="eyebrow">How to make a simulation count</p>
          <ul className="stack stack-2" style={{ paddingLeft: '1.1rem' }}>
            <li className="small">
              <strong>All four sections, same day, in order.</strong> The fatigue is the variable you are testing.
            </li>
            <li className="small">
              <strong>No pausing, no replaying.</strong> Audio plays once in section mode, as it does in the test.
            </li>
            <li className="small">
              <strong>Review the next day, not immediately.</strong> A gap between doing and reviewing produces
              better retention than reading the feedback while the answers are still in working memory.
            </li>
            <li className="small">
              <strong>Once a fortnight at most.</strong> Simulations measure; drills improve. A learner who only
              simulates stops moving.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
