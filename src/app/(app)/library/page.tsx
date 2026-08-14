import type { Metadata } from 'next';
import Link from 'next/link';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { lessonProgress, lessons } from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { SKILL_LABELS, tryMicroSkill, type Domain } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Lessons' };
export const dynamic = 'force-dynamic';

const SKILL_ORDER = ['strategy', 'reading', 'listening', 'writing', 'speaking', 'grammar', 'vocabulary'];

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ micro?: string }> }) {
  const query = await searchParams;
  const session = await requireSession();
  const profile = await getProfile(session.userId, session.orgId);

  const all = (await db.select().from(lessons).where(eq(lessons.status, 'published')));

  // What this learner has already worked through, and how it went. A library
  // that cannot tell you what you have done is a list, not a record.
  const progressRows = await db
    .select({
      lessonId: lessonProgress.lessonId,
      total: lessonProgress.checkpointsTotal,
      correct: lessonProgress.checkpointsCorrect,
      completedAt: lessonProgress.completedAt,
    })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, session.userId), eq(lessonProgress.orgId, session.orgId)));
  const progressByLesson = new Map(progressRows.map((row) => [row.lessonId, row]));

  // Which lessons remediate a micro-skill this learner is actually behind on.
  const weakSlugs = new Set(
    profile.skills.flatMap((s) => s.weakest.map((w) => w.microSkill)),
  );
  if (query.micro) weakSlugs.add(query.micro);

  const prescribed = all.filter((lesson) => {
    const micros = JSON.parse(lesson.microSkills) as string[];
    return micros.some((m) => weakSlugs.has(m));
  });

  const grouped = new Map<string, typeof all>();
  for (const lesson of all) {
    const list = grouped.get(lesson.skill) ?? [];
    list.push(lesson);
    grouped.set(lesson.skill, list);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Lessons</p>
          <h1>One transferable move each</h1>
          <p className="muted measure-wide">
            Every lesson teaches a technique you can carry to a prompt you have never seen, and every one asks you
            to produce it before it moves on. None takes longer than nine minutes.
          </p>
        </div>
      </header>

      {prescribed.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Prescribed for you
            </h2>
            <p className="tiny faint">Matched to the micro-skills currently holding you back</p>
          </div>
          <div className="grid grid-2">
            {prescribed.map((lesson) => {
              const micros = JSON.parse(lesson.microSkills) as string[];
              const reason = micros.find((m) => weakSlugs.has(m));
              return (
                <Link
                  key={lesson.id}
                  href={`/library/${lesson.slug}`}
                  className="panel"
                  data-skill={lesson.skill}
                  style={{ display: 'block', textDecoration: 'none', borderLeft: '3px solid var(--skill)' }}
                >
                  <div className="stack stack-3">
                    <div className="row-tight">
                      <span className="badge badge-accent">{lesson.minutes} min</span>
                      <span className="badge">{SKILL_LABELS[lesson.skill as Domain] ?? lesson.skill}</span>
                    </div>
                    <h3 className="serif" style={{ fontSize: '1.15rem' }}>
                      {lesson.title}
                    </h3>
                    <p className="small muted">{lesson.summary}</p>
                    {reason ? (
                      <p className="tiny faint">
                        Because {tryMicroSkill(reason)?.label.toLowerCase() ?? reason} is below your average.
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {SKILL_ORDER.filter((skill) => grouped.has(skill)).map((skill) => (
        <section key={skill} style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2
              className="row-tight"
              style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}
              data-skill={skill}
            >
              <span className="skill-mark" aria-hidden />
              {skill === 'strategy' ? 'Strategy' : SKILL_LABELS[skill as Domain] ?? skill}
            </h2>
          </div>
          <div className="grid grid-2">
            {(grouped.get(skill) ?? []).map((lesson) => (
              <Link
                key={lesson.id}
                href={`/library/${lesson.slug}`}
                className="panel-quiet"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div className="stack stack-2">
                  <div className="row-between">
                    <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      {lesson.title}
                    </h3>
                    <span className="tiny faint numeric">{lesson.minutes} min</span>
                  </div>
                  <p className="small muted">{lesson.summary}</p>
                  {(() => {
                    const done = progressByLesson.get(lesson.id);
                    if (!done?.completedAt) return null;
                    const clean = done.correct === done.total;
                    return (
                      <p className="tiny">
                        <span className={`badge ${clean ? 'badge-positive' : 'badge-caution'}`}>
                          Done · {done.correct}/{done.total}
                        </span>
                        {clean ? null : (
                          <span className="faint" style={{ marginLeft: 'var(--s2)' }}>
                            the ones you missed are in your review queue
                          </span>
                        )}
                      </p>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
