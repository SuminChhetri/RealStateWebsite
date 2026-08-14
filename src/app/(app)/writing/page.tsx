import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { evaluations, writingSubmissions, writingTasks } from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { LevelScale } from '@/components/Level';
import './writing.css';

export const metadata: Metadata = { title: 'Writing' };
export const dynamic = 'force-dynamic';

export default async function WritingPage() {
  const session = await requireSession();
  const profile = await getProfile(session.userId, session.orgId);
  const estimate = profile.skills.find((s) => s.skill === 'writing')!;

  const tasks = (await db
    .select()
    .from(writingTasks)
    .where(eq(writingTasks.status, 'published'))
    .orderBy(writingTasks.taskType, writingTasks.level)
    );

  const history = (await db
    .select({
      id: writingSubmissions.id,
      submittedAt: writingSubmissions.submittedAt,
      wordCount: writingSubmissions.wordCount,
      title: writingTasks.title,
      taskType: writingTasks.taskType,
      level: evaluations.estimatedLevel,
    })
    .from(writingSubmissions)
    .innerJoin(writingTasks, eq(writingTasks.id, writingSubmissions.taskId))
    .leftJoin(
      evaluations,
      and(eq(evaluations.submissionId, writingSubmissions.id), eq(evaluations.submissionType, 'writing')),
    )
    .where(and(eq(writingSubmissions.userId, session.userId), eq(writingSubmissions.orgId, session.orgId)))
    .orderBy(desc(writingSubmissions.submittedAt))
    .limit(8)
    );

  const emails = tasks.filter((t) => t.taskType === 'writing.email');
  const surveys = tasks.filter((t) => t.taskType === 'writing.survey');

  return (
    <div className="page">
      <header className="page-header" data-skill="writing">
        <div className="row-between wrap" style={{ alignItems: 'flex-start' }}>
          <div className="stack stack-3">
            <p className="eyebrow row-tight">
              <span className="skill-mark" aria-hidden />
              Writing
            </p>
            <h1>Write it under the clock, then find out what is holding it back</h1>
            <p className="muted measure-wide">
              Every submission is analysed on nine dimensions — coverage of the required points, development,
              organisation, cohesion, register, range, accuracy, variety and concision — and each finding is tied to
              something measurable in your text.
            </p>
          </div>
          <div className="panel-quiet stack stack-3" style={{ minWidth: '15rem' }}>
            <LevelScale
              label="Your writing"
              level={estimate.level}
              se={estimate.se}
              target={profile.targetLevel}
              observations={estimate.observations}
            />
            <p className="tiny faint">
              {profile.productiveCounts.writing
                ? `From your last ${Math.min(6, profile.productiveCounts.writing)} submission${profile.productiveCounts.writing === 1 ? '' : 's'}, weighted toward the most recent.`
                : 'Submit one response to place this skill.'}
            </p>
          </div>
        </div>
      </header>

      {history.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Your submissions</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Task</th>
                  <th scope="col">Words</th>
                  <th scope="col">Estimate</th>
                  <th scope="col">Submitted</th>
                  <th scope="col"><span className="visually-hidden">Feedback</span></th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" style={{ fontWeight: 500, textTransform: 'none', fontSize: '0.875rem', color: 'var(--ink)', letterSpacing: 0 }}>
                      {row.title}
                    </th>
                    <td className="num">{row.wordCount}</td>
                    <td className="num">{row.level ? `CLB ${row.level.toFixed(1)}` : '—'}</td>
                    <td className="num">{new Date(row.submittedAt * 1000).toLocaleDateString('en-CA')}</td>
                    <td>
                      <Link className="small" href={`/writing/feedback/${row.id}`}>
                        Feedback
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {[
        { label: 'Task 1 · Writing an Email', items: emails, note: 'A message with a purpose and required content points.' },
        { label: 'Task 2 · Responding to Survey Questions', items: surveys, note: 'Choose one option and argue for it.' },
      ].map((group) => (
        <section key={group.label} style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{group.label}</h2>
            <p className="tiny faint">{group.note}</p>
          </div>
          <div className="grid grid-2">
            {group.items.map((task) => (
              <Link
                key={task.id}
                href={`/writing/${task.slug}`}
                className="panel-quiet"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div className="stack stack-3">
                  <div className="row-tight">
                    <span className="badge">CLB {task.level}</span>
                    <span className="badge">{Math.round(task.timeLimitSeconds / 60)} min</span>
                    <span className="badge">{task.register.replace('_', '-')}</span>
                  </div>
                  <h3 className="serif" style={{ fontSize: '1.15rem' }}>
                    {task.title}
                  </h3>
                  <p className="small muted">{truncate(task.scenario, 170)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function truncate(text: string, n: number): string {
  return text.length <= n ? text : `${text.slice(0, n - 1).trimEnd()}…`;
}
