import type { Metadata } from 'next';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/guard';
import { getProfile, getRecommendations } from '@/lib/learner/profile';
import { descriptorFor } from '@/lib/content/clb';
import { SKILL_LABELS, type Skill } from '@/lib/content/taxonomy';
import { EstimateFootnote, EstimateLabel, LevelScale } from '@/components/Level';

export const metadata: Metadata = { title: 'Today' };
export const dynamic = 'force-dynamic';

const KIND_LABEL: Record<string, string> = {
  drill: 'Practice',
  lesson: 'Lesson',
  review: 'Review',
  writing: 'Writing',
  speaking: 'Speaking',
  mock: 'Simulation',
  diagnostic: 'Diagnostic',
};

export default async function TodayPage() {
  const session = await requireSession();
  const profile = getProfile(session.userId, session.orgId);
  const recommendations = getRecommendations(session.userId, session.orgId, profile);

  const first = recommendations[0];
  const rest = recommendations.slice(1);
  const measured = profile.skills.filter((s) => s.observations > 0);
  const weakest = profile.readiness.weakestSkill;
  const totalMinutes = recommendations.reduce((a, r) => a + r.estimatedMinutes, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div className="row-between wrap">
          <div className="stack stack-2">
            <p className="eyebrow">
              {profile.daysToExam !== null
                ? `${profile.daysToExam} day${profile.daysToExam === 1 ? '' : 's'} to your test`
                : 'No test date set'}
            </p>
            <h1>
              {profile.hasDiagnostic
                ? profile.readiness.ready
                  ? `You are practising at your target of CLB ${profile.targetLevel}.`
                  : `Getting to CLB ${profile.targetLevel}`
                : 'Let’s find out where you stand'}
            </h1>
            {profile.hasDiagnostic && weakest ? (
              <p className="muted measure-wide">
                Your overall practice estimate is CLB {profile.readiness.overall.toFixed(1)}.{' '}
                {SKILL_LABELS[weakest]} is the skill furthest from your target, and it is where today’s work is
                weighted.
              </p>
            ) : (
              <p className="muted measure-wide">
                Twenty-five minutes of mixed reading and listening, sampling the micro-skills that separate the
                bands. You get a profile at the end, not a percentage.
              </p>
            )}
          </div>
          <div className="stack stack-2" style={{ alignItems: 'flex-end' }}>
            <p className="tiny faint">This week</p>
            <p className="numeric" style={{ fontSize: '1.35rem' }}>
              {profile.minutesThisWeek} min
            </p>
            {profile.streakDays > 0 ? (
              <p className="tiny muted">
                {profile.streakDays}-day streak
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {/* --- The single highest-value action --- */}
      {first ? (
        <section className="stack stack-4" style={{ marginBottom: 'var(--s7)' }} data-skill={first.skill}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Start here
            </h2>
            <p className="tiny faint">
              {totalMinutes} min planned · about {profile.minutesPerDay} min available
            </p>
          </div>

          <article className="panel" style={{ borderLeft: '3px solid var(--skill, var(--accent))' }}>
            <div className="stack stack-4">
              <div className="row-between wrap">
                <div className="row-tight">
                  <span className="badge badge-accent">{KIND_LABEL[first.kind] ?? first.kind}</span>
                  {first.skill !== 'mixed' &&
                  SKILL_LABELS[first.skill as Skill] !== KIND_LABEL[first.kind] ? (
                    <span className="badge">{SKILL_LABELS[first.skill as Skill] ?? first.skill}</span>
                  ) : null}
                  <span className="badge">{first.estimatedMinutes} min</span>
                </div>
              </div>
              <h3 className="serif" style={{ fontSize: '1.4rem' }}>
                {first.title}
              </h3>
              <p className="measure-wide" style={{ color: 'var(--ink-secondary)' }}>
                {first.rationale}
              </p>
              <div className="row wrap">
                <Link className="btn btn-primary btn-lg" href={first.href}>
                  Begin
                </Link>
                {rest.length ? <span className="tiny faint">Then {rest.length} more suggested below</span> : null}
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {/* --- The rest of today --- */}
      {rest.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Also worth your time
            </h2>
            <Link className="small" href="/plan">
              See the full plan
            </Link>
          </div>
          <ul className="stack stack-3" style={{ listStyle: 'none', padding: 0 }}>
            {rest.map((rec) => (
              <li key={rec.href + rec.title} data-skill={rec.skill}>
                <Link
                  href={rec.href}
                  className="panel-quiet skill-rule"
                  style={{ display: 'block', textDecoration: 'none', padding: 'var(--s4) var(--s4)' }}
                >
                  <div className="row-between wrap" style={{ alignItems: 'flex-start' }}>
                    <div className="stack stack-2" style={{ minWidth: 0 }}>
                      <div className="row-tight">
                        <span className="eyebrow">{KIND_LABEL[rec.kind] ?? rec.kind}</span>
                        <span className="tiny faint">{rec.estimatedMinutes} min</span>
                      </div>
                      <p style={{ fontWeight: 500 }}>{rec.title}</p>
                      <p className="small muted measure-wide">{rec.rationale}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* --- Where you stand --- */}
      <section>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Where you stand</h2>
          <Link className="small" href="/path">
            Your CLB {profile.targetLevel} path
          </Link>
        </div>

        <div className="grid grid-2">
          {profile.skills.map((estimate) => {
            const skill = estimate.skill as Skill;
            const descriptor = estimate.observations ? descriptorFor(skill, estimate.level) : null;
            return (
              <article key={skill} className="panel-quiet" data-skill={skill}>
                <div className="stack stack-4">
                  <div className="row-between">
                    <h3 className="row-tight" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      <span className="skill-mark" aria-hidden />
                      {SKILL_LABELS[skill]}
                    </h3>
                    <EstimateLabel level={estimate.level} se={estimate.se} observations={estimate.observations} />
                  </div>

                  <LevelScale
                    level={estimate.level}
                    se={estimate.se}
                    target={profile.targetLevel}
                    observations={estimate.observations}
                    emptyNote={null}
                  />

                  {descriptor ? (
                    <div className="stack stack-2">
                      <p className="small">
                        <span className="muted">What holds you at this level: </span>
                        {descriptor.ceiling}
                      </p>
                      <p className="small">
                        <span className="muted">Highest-leverage change: </span>
                        {descriptor.lever}
                      </p>
                    </div>
                  ) : (
                    <p className="small muted">
                      {skill === 'writing' || skill === 'speaking'
                        ? `Submit one ${skill} task to place this skill.`
                        : 'Complete a practice set to place this skill.'}
                    </p>
                  )}

                  {estimate.timePressureGap !== null && estimate.timePressureGap > 0.8 ? (
                    <p className="small" style={{ color: 'var(--caution)' }}>
                      Your untimed accuracy runs about {estimate.timePressureGap.toFixed(1)} levels above your timed
                      accuracy — this is a speed problem, not a knowledge problem.
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: 'var(--s4)' }}>
          <EstimateFootnote />
        </div>
      </section>

      {measured.length > 0 && profile.openMistakes > 0 ? (
        <section style={{ marginTop: 'var(--s7)' }}>
          <div className="panel-quiet row-between wrap">
            <div className="stack stack-2">
              <p style={{ fontWeight: 500 }}>
                {profile.openMistakes} unresolved mistake{profile.openMistakes === 1 ? '' : 's'} in your bank
              </p>
              <p className="small muted measure-wide">
                A mistake is only closed once you have answered three later items that force the same decision
                correctly. Until then it stays here and keeps coming back.
              </p>
            </div>
            <Link className="btn" href="/mistakes">
              Open the bank
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
