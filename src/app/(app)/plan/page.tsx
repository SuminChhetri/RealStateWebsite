import type { Metadata } from 'next';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/guard';
import { getProfile } from '@/lib/learner/profile';
import { generatePlan } from '@/lib/engines/plan';
import { tryMicroSkill } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Study plan' };
export const dynamic = 'force-dynamic';

const HORIZONS = [7, 14, 30, 60, 90];

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const query = await searchParams;
  const session = await requireSession();
  const profile = getProfile(session.userId, session.orgId);

  const requested = Number(query.days);
  const horizon = HORIZONS.includes(requested)
    ? requested
    : profile.daysToExam !== null
      ? HORIZONS.find((h) => h >= profile.daysToExam!) ?? 90
      : 30;

  const weakMicroSkills = profile.skills
    .flatMap((s) =>
      s.weakest.map((w) => ({
        microSkill: w.microSkill,
        skill: s.skill,
        theta: w.theta,
        label: tryMicroSkill(w.microSkill)?.label ?? w.microSkill,
      })),
    )
    .sort((a, b) => a.theta - b.theta);

  const plan = generatePlan({
    horizonDays: horizon,
    startDate: new Date(),
    targetLevel: profile.targetLevel,
    minutesPerDay: profile.minutesPerDay,
    daysPerWeek: profile.daysPerWeek,
    skills: profile.skills,
    weakMicroSkills,
    examDate: profile.examDate,
  });

  const studyDays = plan.days.filter((d) => !d.rest);
  const visible = plan.days.slice(0, 21);

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Study plan</p>
          <h1>{horizon} days to CLB {profile.targetLevel}</h1>
          <p className="muted measure-wide">{plan.rationale}</p>
        </div>
      </header>

      <div className="row wrap" style={{ marginBottom: 'var(--s6)' }}>
        {HORIZONS.map((days) => (
          <Link
            key={days}
            href={`/plan?days=${days}`}
            className="btn btn-sm"
            style={
              days === horizon
                ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)', fontWeight: 600 }
                : undefined
            }
          >
            {days} days
          </Link>
        ))}
      </div>

      {/* --- The honest projection --- */}
      <section
        className="panel"
        style={{
          marginBottom: 'var(--s6)',
          borderLeft: `3px solid ${
            plan.projection.verdict === 'unrealistic'
              ? 'var(--critical)'
              : plan.projection.verdict === 'tight'
                ? 'var(--caution)'
                : 'var(--positive)'
          }`,
        }}
      >
        <div className="stack stack-3">
          <div className="row-tight">
            <span
              className={`badge ${
                plan.projection.verdict === 'unrealistic'
                  ? 'badge-critical'
                  : plan.projection.verdict === 'tight'
                    ? 'badge-caution'
                    : 'badge-positive'
              }`}
            >
              {plan.projection.verdict === 'unknown' ? 'Not enough evidence' : plan.projection.verdict}
            </span>
            <span className="tiny faint numeric">
              {plan.projection.hoursScheduled}h scheduled
              {plan.projection.hoursNeeded ? ` · ~${plan.projection.hoursNeeded}h typically needed` : ''}
            </span>
          </div>
          <p className="measure-wide">{plan.projection.message}</p>
        </div>
      </section>

      {/* --- The schedule --- */}
      <section style={{ marginBottom: 'var(--s6)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            The next three weeks
          </h2>
          <p className="tiny faint">
            {studyDays.length} study days · {Math.round(plan.projection.hoursScheduled)} hours total
          </p>
        </div>

        <ol className="divide" style={{ listStyle: 'none', padding: 0 }}>
          {visible.map((day) => (
            <li key={day.dayIndex} style={{ paddingBlock: 'var(--s4)' }}>
              <div className="row" style={{ alignItems: 'flex-start', gap: 'var(--s5)' }}>
                <div className="stack stack-1" style={{ minWidth: '5.5rem' }}>
                  <p className="small" style={{ fontWeight: 600 }}>
                    {new Date(`${day.date}T00:00:00Z`).toLocaleDateString('en-CA', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </p>
                  <p className="tiny faint">{day.rest ? '—' : `${day.totalMinutes} min`}</p>
                </div>

                {day.rest ? (
                  <p className="small muted" style={{ paddingTop: '0.1rem' }}>
                    Consolidation day. Scheduled, not skipped — the gap between sessions is where the learning
                    settles.
                  </p>
                ) : (
                  <div className="stack stack-3 grow">
                    <p className="eyebrow">{day.focus}</p>
                    <ul className="stack stack-2" style={{ listStyle: 'none', padding: 0 }}>
                      {day.blocks.map((block) => (
                        <li key={block.id} data-skill={block.skill}>
                          <Link
                            href={block.href}
                            className="skill-rule"
                            style={{ display: 'block', textDecoration: 'none', paddingBlock: '0.15rem' }}
                          >
                            <div className="row-between wrap">
                              <span className="small" style={{ fontWeight: 500 }}>
                                {block.title}
                              </span>
                              <span className="tiny faint numeric">{block.minutes} min</span>
                            </div>
                            <p className="tiny muted">{block.note}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        {plan.days.length > visible.length ? (
          <p className="tiny faint" style={{ marginTop: 'var(--s4)' }}>
            {plan.days.length - visible.length} further days follow the same pattern. The plan regenerates whenever
            your estimates move, so there is no value in reading it further ahead than this.
          </p>
        ) : null}
      </section>

      <section>
        <div className="panel-quiet stack stack-3">
          <p className="eyebrow">Why the plan looks like this</p>
          <ul className="stack stack-2" style={{ paddingLeft: '1.1rem' }}>
            <li className="small">
              <strong>Distributed, not blocked.</strong> Each skill appears on several separated days rather than in
              one long session, because spacing is what makes practice stick.
            </li>
            <li className="small">
              <strong>Interleaved within a day.</strong> Two skills per session rather than one — telling problem
              types apart is part of what the test measures.
            </li>
            <li className="small">
              <strong>Retrieval first.</strong> Every study day opens with scheduled review, which protects
              everything already learned before adding anything new.
            </li>
            <li className="small">
              <strong>Rest is scheduled.</strong> Consolidation days are part of the design, not gaps in it.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
