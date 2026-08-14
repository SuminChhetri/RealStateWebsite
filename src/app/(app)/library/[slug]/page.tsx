import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { lessons } from '@/lib/db/schema';
import type { LessonBlock } from '@/lib/content/seed/types';
import { LessonView } from '@/components/lesson/LessonView';
import { SKILL_LABELS, tryMicroSkill, type Domain } from '@/lib/content/taxonomy';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = (await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1))[0];
  return { title: lesson?.title ?? 'Lesson' };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireSession();

  const lesson = (await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1))[0];
  if (!lesson || lesson.status !== 'published') notFound();

  const blocks = JSON.parse(lesson.blocks) as LessonBlock[];
  const micros = JSON.parse(lesson.microSkills) as string[];

  const practiceSkill = micros
    .map((m) => tryMicroSkill(m))
    .find((m) => m?.skill === 'reading' || m?.skill === 'listening');

  return (
    <div className="page-narrow">
      <header className="page-header" data-skill={lesson.skill}>
        <div className="stack stack-3">
          <p className="eyebrow row-tight">
            <span className="skill-mark" aria-hidden />
            {lesson.skill === 'strategy' ? 'Strategy' : SKILL_LABELS[lesson.skill as Domain] ?? lesson.skill} ·{' '}
            {lesson.minutes} min
          </p>
          <h1>{lesson.title}</h1>
          <p className="muted measure-wide">{lesson.summary}</p>
          {micros.length ? (
            <ul className="row wrap" style={{ listStyle: 'none', padding: 0, gap: 'var(--s2)' }}>
              {micros.map((m) => (
                <li key={m}>
                  <span className="badge">{tryMicroSkill(m)?.label ?? m}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      <LessonView blocks={blocks} lessonSlug={lesson.slug} />

      <section style={{ marginTop: 'var(--s7)' }}>
        <div className="panel stack stack-4">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Use it now, while it is fresh
          </h2>
          <p className="small muted measure-wide">
            A technique read and not used is gone within a day. A set attempted immediately afterwards, deliberately
            applying it, is how it becomes yours.
          </p>
          <div className="row wrap">
            {practiceSkill ? (
              <Link
                className="btn btn-primary"
                href={`/practice/${practiceSkill.skill}?micro=${encodeURIComponent(practiceSkill.slug)}`}
              >
                Practise {practiceSkill.label.toLowerCase()}
              </Link>
            ) : null}
            {lesson.skill === 'writing' ? (
              <Link className="btn btn-primary" href="/writing">
                Write a task
              </Link>
            ) : null}
            {lesson.skill === 'speaking' ? (
              <Link className="btn btn-primary" href="/speaking">
                Record a task
              </Link>
            ) : null}
            <Link className="btn" href="/library">
              Back to lessons
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
