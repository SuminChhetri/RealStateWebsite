import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { evaluations, speakingSubmissions, speakingTasks } from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { replenishSpeaking, speakingPoolStatus } from '@/lib/practice/replenish';
import { LevelScale } from '@/components/Level';

export const metadata: Metadata = { title: 'Speaking' };
export const dynamic = 'force-dynamic';

export default async function SpeakingPage() {
  const session = await requireSession();
  // One fresh prompt per task type when the learner is close to having done
  // them all. Normally a no-op.
  await replenishSpeaking(session.userId, session.orgId);

  const profile = await getProfile(session.userId, session.orgId);
  const estimate = profile.skills.find((s) => s.skill === 'speaking')!;
  const pool = await speakingPoolStatus(session.userId, session.orgId);

  const tasks = (await db
    .select()
    .from(speakingTasks)
    .where(eq(speakingTasks.status, 'published'))
    .orderBy(speakingTasks.taskNumber, speakingTasks.level)
    );

  const history = (await db
    .select({
      id: speakingSubmissions.id,
      submittedAt: speakingSubmissions.submittedAt,
      durationMs: speakingSubmissions.durationMs,
      transcriptSource: speakingSubmissions.transcriptSource,
      title: speakingTasks.title,
      taskNumber: speakingTasks.taskNumber,
      level: evaluations.estimatedLevel,
    })
    .from(speakingSubmissions)
    .innerJoin(speakingTasks, eq(speakingTasks.id, speakingSubmissions.taskId))
    .leftJoin(
      evaluations,
      and(eq(evaluations.submissionId, speakingSubmissions.id), eq(evaluations.submissionType, 'speaking')),
    )
    .where(and(eq(speakingSubmissions.userId, session.userId), eq(speakingSubmissions.orgId, session.orgId)))
    .orderBy(desc(speakingSubmissions.submittedAt))
    .limit(8)
    );

  const grouped = new Map<number, typeof tasks>();
  for (const task of tasks) {
    const list = grouped.get(task.taskNumber) ?? [];
    list.push(task);
    grouped.set(task.taskNumber, list);
  }

  return (
    <div className="page">
      <header className="page-header" data-skill="speaking">
        <div className="row-between wrap" style={{ alignItems: 'flex-start' }}>
          <div className="stack stack-3">
            <p className="eyebrow row-tight">
              <span className="skill-mark" aria-hidden />
              Speaking
            </p>
            <h1>Eight tasks, eight different jobs</h1>
            <p className="muted measure-wide">
              Record under the real clock. Meridian measures your delivery from the audio — pause structure, time
              use, speech rate — and your content from the transcript, then tells you which of the two is holding
              you back.
            </p>
          </div>
          <div className="panel-quiet stack stack-3" style={{ minWidth: '15rem' }}>
            <LevelScale
              label="Your speaking"
              level={estimate.level}
              se={estimate.se}
              target={profile.targetLevel}
              observations={estimate.observations}
            />
            <p className="tiny faint">
              {profile.productiveCounts.speaking
                ? `From your last ${Math.min(6, profile.productiveCounts.speaking)} recording${profile.productiveCounts.speaking === 1 ? '' : 's'}.`
                : 'Record one response to place this skill.'}
            </p>
          </div>
        </div>
      </header>

      {history.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Your recordings</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Task</th>
                  <th scope="col">Length</th>
                  <th scope="col">Transcript</th>
                  <th scope="col">Estimate</th>
                  <th scope="col"><span className="visually-hidden">Feedback</span></th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" style={{ fontWeight: 500, textTransform: 'none', fontSize: '0.875rem', color: 'var(--ink)', letterSpacing: 0 }}>
                      {row.title}
                    </th>
                    <td className="num">{Math.round(row.durationMs / 1000)}s</td>
                    <td className="small muted">
                      {row.transcriptSource === 'browser_asr'
                        ? 'Recognised'
                        : row.transcriptSource === 'manual'
                          ? 'Typed'
                          : 'None'}
                    </td>
                    <td className="num">{row.level ? `CLB ${row.level.toFixed(1)}` : '—'}</td>
                    <td>
                      <Link className="small" href={`/speaking/feedback/${row.id}`}>
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

      <p className="tiny faint" style={{ marginBottom: 'var(--s5)' }}>
        {pool.total} prompt{pool.total === 1 ? '' : 's'} available — {pool.authored} written by an author,{' '}
        {pool.generated} assembled by the prompt generator, with more made before you run out. Generated prompts
        are marked. They are combinatorial, so across many you will notice a family resemblance the authored ones
        do not have; the analysis you get back is identical either way.
      </p>
      <section>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>The eight tasks</h2>
          <p className="tiny faint">Each one tests a different communicative job</p>
        </div>

        <div className="stack stack-4">
          {[...grouped.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([number, group]) => (
              <div key={number} className="panel-quiet" data-skill="speaking">
                <div className="stack stack-3">
                  <div className="row-tight wrap">
                    <span className="badge badge-accent numeric">Task {number}</span>
                    <span className="badge numeric">
                      {group[0].prepSeconds}s prep · {group[0].speakSeconds}s speaking
                    </span>
                  </div>
                  <div className="grid grid-2">
                    {group.map((task) => (
                      <Link
                        key={task.id}
                        href={`/speaking/${task.slug}`}
                        className="skill-rule"
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <div className="stack stack-1">
                          <p style={{ fontWeight: 500 }}>
                            {task.title}
                            {task.origin === 'generated' ? (
                              <span
                                className="badge badge-quiet"
                                style={{ marginLeft: 'var(--s2)' }}
                                title="Assembled by the prompt generator from authored frames. The analysis is identical — pause structure comes from your audio and the moves are detected in your transcript."
                              >
                                Generated
                              </span>
                            ) : null}
                          </p>
                          <p className="small muted">{truncate(task.prompt, 130)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

function truncate(text: string, n: number): string {
  return text.length <= n ? text : `${text.slice(0, n - 1).trimEnd()}…`;
}
