import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { speakingTasks } from '@/lib/db/schema';
import { Recorder } from '@/components/speaking/Recorder';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const task = db.select().from(speakingTasks).where(eq(speakingTasks.slug, slug)).get();
  return { title: task?.title ?? 'Speaking task' };
}

export default async function SpeakingTaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireSession();

  const task = db.select().from(speakingTasks).where(eq(speakingTasks.slug, slug)).get();
  if (!task || task.status !== 'published') notFound();

  const context = task.context
    ? (JSON.parse(task.context) as { lines?: string[]; scene?: string; options?: string[] })
    : null;
  const successCriteria = JSON.parse(task.successCriteria) as string[];

  return (
    <div className="page-narrow">
      <header className="page-header" data-skill="speaking">
        <div className="stack stack-4">
          <p className="eyebrow row-tight">
            <span className="skill-mark" aria-hidden />
            Task {task.taskNumber}
          </p>
          <h1>{task.title}</h1>

          <div className="panel stack stack-4">
            <div className="stack stack-2">
              <p className="eyebrow">The task</p>
              <p className="prose" style={{ maxWidth: '40rem' }}>
                {task.prompt}
              </p>
            </div>

            {context?.scene ? (
              <div className="stack stack-2">
                <p className="eyebrow">The scene</p>
                <p className="inset small" style={{ fontFamily: 'var(--font-reading)', lineHeight: 1.7 }}>
                  {context.scene}
                </p>
                <p className="tiny faint">
                  Described in words rather than shown as a picture: an image generated for this product would be
                  a stand-in either way, and a written scene keeps the detail precise and the same for everyone.
                </p>
              </div>
            ) : null}

            {context?.options?.length ? (
              <div className="stack stack-2">
                <p className="eyebrow">Your two options</p>
                <ul className="stack stack-2" style={{ listStyle: 'none', padding: 0 }}>
                  {context.options.map((option, i) => (
                    <li key={i} className="inset small">
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {context?.lines?.length ? (
              <div className="stack stack-2">
                <p className="eyebrow">What you know</p>
                <ul className="stack stack-1" style={{ paddingLeft: '1.1rem' }}>
                  {context.lines.map((line, i) => (
                    <li key={i} className="small">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <Recorder
        taskSlug={task.slug}
        prepSeconds={task.prepSeconds}
        speakSeconds={task.speakSeconds}
        successCriteria={successCriteria}
      />
    </div>
  );
}
