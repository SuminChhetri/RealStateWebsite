import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, sql } from 'drizzle-orm';
import { checkFeature, requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { lessonProgress, lessons, mistakes, users } from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { buildReadinessReport, VERDICT_LABELS } from '@/lib/engines/readiness-report';
import { ESTIMATE_DISCLAIMER } from '@/lib/content/clb';
import { LockedFeature } from '@/components/LockedFeature';
import { PrintButton } from './PrintButton';
import './report.css';

export const metadata: Metadata = { title: 'Readiness report' };
export const dynamic = 'force-dynamic';

const LOW = 4;
const HIGH = 12;

/**
 * The readiness report.
 *
 * This is the one surface built to leave the product — printed, and handed to a
 * tutor or kept as a record. Three consequences follow, and they are the reason
 * this page is written the way it is:
 *
 *  - It is a semantic document, not a rendering. Real headings, real tables,
 *    real text. That is what makes it work in a screen reader, reflow at 200%,
 *    and survive a greyscale printer.
 *  - Every band is stated numerically as well as drawn, because a tinted
 *    rectangle carries no information on a mono laser or for a reader who
 *    cannot separate the tints.
 *  - The non-affiliation statement prints on every page. Once this is on paper
 *    in someone else's hands it will be read as a credential unless the page in
 *    front of them says otherwise.
 *
 * Nothing here is stored. The report is generated from live rows on each view,
 * which also means deleting an account removes it by construction.
 */
export default async function ReportPage() {
  const session = await requireSession();
  const gate = await checkFeature(session, 'readiness_report');

  const profile = await getProfile(session.userId, session.orgId);

  if (!gate.allowed) {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Readiness report</p>
            <h1>A record you can hand to someone</h1>
            <p className="muted measure-wide">
              A printable evidence pack: where each skill sits with its uncertainty band, what is holding it
              down, whether your target is reachable in the time left, and a section written for a tutor.
            </p>
          </div>
        </header>
        <LockedFeature
          feature="readiness_report"
          currentPlan={gate.plan}
          requiredPlan={gate.required}
          what="the printable readiness report"
        />
      </div>
    );
  }

  const report = buildReadinessReport(profile);
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  const taught = await db
    .select({ title: lessons.title, completedAt: lessonProgress.completedAt })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .where(
      and(
        eq(lessonProgress.userId, session.userId),
        eq(lessonProgress.orgId, session.orgId),
        sql`${lessonProgress.completedAt} is not null`,
      ),
    )
    .orderBy(desc(lessonProgress.completedAt))
    .limit(12);

  const openMistakes = await db
    .select({ summary: mistakes.summary, occurrences: mistakes.occurrences, skill: mistakes.skill })
    .from(mistakes)
    .where(
      and(
        eq(mistakes.userId, session.userId),
        eq(mistakes.orgId, session.orgId),
        sql`${mistakes.resolvedAt} is null`,
      ),
    )
    .orderBy(desc(mistakes.occurrences))
    .limit(6);

  const generated = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const scale = (value: number) => ((Math.min(HIGH, Math.max(LOW, value)) - LOW) / (HIGH - LOW)) * 100;

  return (
    <div className="report">
      <div className="row-between wrap no-print" style={{ marginBottom: 'var(--s5)' }}>
        <p className="eyebrow">Readiness report</p>
        <PrintButton />
      </div>

      <header className="report-head">
        <h1 style={{ fontSize: '1.75rem' }}>Readiness report</h1>
        <div className="report-meta">
          <div>
            <span className="tiny faint">Prepared for</span>
            <span className="small" style={{ fontWeight: 500 }}>
              {user?.name}
            </span>
          </div>
          <div>
            <span className="tiny faint">Target</span>
            <span className="small numeric" style={{ fontWeight: 500 }}>
              CLB {report.target}
            </span>
          </div>
          <div>
            <span className="tiny faint">Test date</span>
            <span className="small numeric" style={{ fontWeight: 500 }}>
              {profile.examDate ?? 'Not booked'}
              {report.daysToExam !== null ? ` (${report.daysToExam} days)` : ''}
            </span>
          </div>
          <div>
            <span className="tiny faint">Generated</span>
            <span className="small numeric" style={{ fontWeight: 500 }}>
              {generated}
            </span>
          </div>
          <div>
            <span className="tiny faint">Evidence</span>
            <span className="small numeric" style={{ fontWeight: 500 }}>
              {report.totalObservations} items answered
            </span>
          </div>
        </div>
      </header>

      {/* --- The verdict --- */}
      <section className="report-section">
        <h2 style={{ fontSize: '1.15rem', marginBottom: 'var(--s3)' }}>Where this stands</h2>
        <div className="report-verdict" data-verdict={report.verdict}>
          <div className="stack stack-3">
            <p className="eyebrow">{VERDICT_LABELS[report.verdict]}</p>
            <p className="serif" style={{ fontSize: '1.2rem', lineHeight: 1.4 }}>
              {report.headline}
            </p>
            <p className="small measure-wide">{report.reasoning}</p>
          </div>
        </div>
        <p className="tiny faint" style={{ marginTop: 'var(--s3)' }}>
          This verdict describes performance on Meridian practice material against a lower confidence bound. It
          is not a predicted CELPIP result and has no official standing.
        </p>
      </section>

      {/* --- Skill by skill --- */}
      <section className="report-section">
        <h2 style={{ fontSize: '1.15rem', marginBottom: 'var(--s3)' }}>Skill by skill</h2>
        {report.skills.length === 0 ? (
          <p className="small muted">No skill has been measured yet.</p>
        ) : (
          report.skills.map((skill) => (
            <div key={skill.skill} className="report-skill" data-skill={skill.skill}>
              <div className="stack stack-1">
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {skill.label}
                </h3>
                {/* Stated, not only drawn. The figure is the content. */}
                <p className="small numeric">
                  CLB {skill.level.toFixed(1)} ({skill.low.toFixed(1)}–{skill.high.toFixed(1)})
                </p>
                <p className="tiny faint">
                  {skill.observations} items · {skill.meetsTarget ? 'at target' : `below CLB ${report.target}`}
                </p>
              </div>
              <div className="stack stack-2">
                <div className="report-band" aria-hidden>
                  <span
                    className="report-band-interval"
                    style={{ left: `${scale(skill.low)}%`, width: `${scale(skill.high) - scale(skill.low)}%` }}
                  />
                  <span className="report-band-point" style={{ left: `${scale(skill.level)}%` }} />
                  <span className="report-band-target" style={{ left: `${scale(report.target)}%` }} />
                </div>
                <div className="report-scale" aria-hidden>
                  {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((tick) => (
                    <span key={tick}>{tick}</span>
                  ))}
                </div>
                {skill.holdingBack ? (
                  <p className="small">
                    <strong>Weakest component:</strong> {skill.holdingBack}
                  </p>
                ) : null}
                {skill.nextMove ? (
                  <p className="small muted">
                    <strong>What separates a strong performance:</strong> {skill.nextMove}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        )}
        {report.unmeasured.length ? (
          <p className="small muted" style={{ marginTop: 'var(--s4)' }}>
            Not measured: {report.unmeasured.join(', ')}. Nothing above describes{' '}
            {report.unmeasured.length === 1 ? 'it' : 'them'}.
          </p>
        ) : null}
      </section>

      {/* --- For a tutor. Starts its own page in print. --- */}
      <section className="report-section report-for-tutor">
        <h2 style={{ fontSize: '1.15rem', marginBottom: 'var(--s2)' }}>For a teacher or tutor</h2>
        <p className="small muted measure-wide" style={{ marginBottom: 'var(--s4)' }}>
          What has been covered, what is still open, and what an hour with this learner should be spent on.
        </p>

        <div className="stack stack-5">
          <div className="stack stack-2">
            <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Spend the hour on
            </h3>
            {report.weakest ? (
              <p className="small measure-wide">
                <strong>{report.weakest.label}</strong>
                {report.weakest.holdingBack ? ` — specifically: ${report.weakest.holdingBack}` : ''}. It is the
                lowest measured skill at CLB {report.weakest.level.toFixed(1)}, and an overall result is bounded
                by its weakest component.
              </p>
            ) : (
              <p className="small muted">Not enough measured yet to say.</p>
            )}
          </div>

          <div className="stack stack-2">
            <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Already taught here
            </h3>
            {taught.length ? (
              <ul className="stack stack-1" style={{ paddingLeft: '1.1rem' }}>
                {taught.map((lesson) => (
                  <li key={lesson.title} className="small">
                    {lesson.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small muted">No lessons completed yet — nothing has been formally taught.</p>
            )}
          </div>

          <div className="stack stack-2">
            <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Still unresolved
            </h3>
            {openMistakes.length ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th scope="col">Error</th>
                      <th scope="col">Skill</th>
                      <th scope="col">Times</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openMistakes.map((mistake) => (
                      <tr key={mistake.summary}>
                        <td className="small">{mistake.summary}</td>
                        <td className="small">{mistake.skill}</td>
                        <td className="num numeric">{mistake.occurrences}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="small muted">Nothing open.</p>
            )}
            <p className="tiny faint">
              An error stays on this list until it has been answered correctly three times on later items. One
              correct answer is a coin flip.
            </p>
          </div>
        </div>
      </section>

      <div className="report-note">
        <p className="tiny faint">{ESTIMATE_DISCLAIMER}</p>
        <p className="tiny faint" style={{ marginTop: 'var(--s2)' }}>
          Meridian is an independent preparation platform. It is not affiliated with, endorsed by, or connected
          to the organisations that produce or administer the CELPIP test. Figures here describe practice on this
          platform only.
        </p>
        <p className="tiny faint no-print" style={{ marginTop: 'var(--s3)' }}>
          <Link href="/progress">See the full progress view</Link> for trends over time.
        </p>
      </div>

      {/* Printed on every physical page. */}
      <div className="report-print-footer">
        Meridian practice estimates — not CELPIP scores, no official standing. Independent of the organisations
        that produce or administer the CELPIP test. Generated {generated} for {user?.name}.
      </div>
    </div>
  );
}
