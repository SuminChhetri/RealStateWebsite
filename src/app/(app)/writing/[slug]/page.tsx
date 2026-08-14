import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { writingTasks } from '@/lib/db/schema';
import { submitWriting } from '@/lib/practice/writing-actions';
import { WritingEditor } from '@/components/writing/Editor';
import '../writing.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const task = (await db.select().from(writingTasks).where(eq(writingTasks.slug, slug)).limit(1))[0];
  return { title: task?.title ?? 'Writing task' };
}

export default async function WritingTaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireSession();

  const task = (await db.select().from(writingTasks).where(eq(writingTasks.slug, slug)).limit(1))[0];
  if (!task || task.status !== 'published') notFound();

  const requirements = JSON.parse(task.requirements) as string[];
  const choices = task.choices ? (JSON.parse(task.choices) as string[]) : null;

  return (
    <div className="page">
      <header className="page-header" data-skill="writing">
        <div className="stack stack-4">
          <p className="eyebrow row-tight">
            <span className="skill-mark" aria-hidden />
            {task.taskType === 'writing.email' ? 'Task 1 · Writing an Email' : 'Task 2 · Survey Response'}
          </p>
          <h1>{task.title}</h1>

          <div className="panel stack stack-4">
            <div className="stack stack-3">
              <p className="eyebrow">The situation</p>
              <p className="prose" style={{ maxWidth: '42rem' }}>
                {task.scenario}
              </p>
            </div>

            {choices ? (
              <div className="stack stack-3">
                <p className="eyebrow">Your options</p>
                <ul className="stack stack-2" style={{ listStyle: 'none', padding: 0 }}>
                  {choices.map((choice, i) => (
                    <li key={i} className="inset">
                      <p className="small">{choice}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="stack stack-2">
              <p className="eyebrow">Instructions</p>
              <p className="small">{task.instructions}</p>
              <p className="tiny faint">
                {task.minWords}–{task.maxWords} words · {Math.round(task.timeLimitSeconds / 60)} minutes ·{' '}
                {task.register.replace('_', '-')} register
              </p>
            </div>
          </div>
        </div>
      </header>

      <WritingEditor
        taskSlug={task.slug}
        requirements={requirements}
        minWords={task.minWords}
        maxWords={task.maxWords}
        timeLimitSeconds={task.timeLimitSeconds}
        submitAction={submitWriting}
      />
    </div>
  );
}
