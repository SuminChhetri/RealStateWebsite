import type { Metadata } from 'next';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/guard';
import { getProfile, getRecommendations } from '@/lib/learner/profile';
import { descriptorFor, projectedHours, LEVEL_DESCRIPTORS } from '@/lib/content/clb';
import { SKILLS, SKILL_LABELS, tryMicroSkill, type Skill } from '@/lib/content/taxonomy';
import { EstimateFootnote, LevelScale } from '@/components/Level';

export const metadata: Metadata = { title: 'Your CLB path' };
export const dynamic = 'force-dynamic';

export default async function PathPage() {
  const session = await requireSession();
  const profile = getProfile(session.userId, session.orgId);
  const recommendations = getRecommendations(session.userId, session.orgId, profile);

  const measured = profile.skills.filter((s) => s.observations > 0);
  const overall = profile.readiness.overall;
  const hours = overall ? projectedHours(overall, profile.targetLevel) : 0;
  const weeksAtCurrentPace =
    profile.minutesPerDay && profile.daysPerWeek
      ? Math.ceil((hours * 60) / (profile.minutesPerDay * profile.daysPerWeek))
      : null;

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Your path</p>
          <h1>
            {overall
              ? `CLB ${overall.toFixed(1)} → CLB ${profile.targetLevel}`
              : `Getting to CLB ${profile.targetLevel}`}
          </h1>
          <p className="muted measure-wide">
            {overall
              ? profile.readiness.ready
                ? 'Every skill estimate — including its lower bound — sits at or above your target. From here the work is holding the level and removing inconsistency, not climbing.'
                : `The distance is not the same in every skill, and the fastest route runs through whichever one has the largest gap and the most leverage.`
              : 'Complete the diagnostic to place yourself on this path.'}
          </p>
        </div>
      </header>

      {/* --- The gaps --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            The gap in each skill
          </h2>
        </div>
        <div className="stack stack-5">
          {profile.readiness.gaps.map((gap) => {
            const estimate = profile.skills.find((s) => s.skill === gap.skill)!;
            const descriptor = estimate.observations ? descriptorFor(gap.skill, estimate.level) : null;
            return (
              <article key={gap.skill} className="panel" data-skill={gap.skill} style={{ borderLeft: '3px solid var(--skill)' }}>
                <div className="stack stack-4">
                  <div className="row-between wrap">
                    <h3 className="row-tight" style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      <span className="skill-mark" aria-hidden />
                      {SKILL_LABELS[gap.skill]}
                    </h3>
                    <span
                      className={`badge numeric ${
                        !estimate.observations
                          ? ''
                          : gap.gap === 0
                            ? 'badge-positive'
                            : gap.gap > 2
                              ? 'badge-critical'
                              : 'badge-caution'
                      }`}
                    >
                      {estimate.observations
                        ? gap.gap === 0
                          ? 'At target'
                          : `${gap.gap.toFixed(1)} levels to go`
                        : 'Not measured'}
                    </span>
                  </div>

                  <LevelScale
                    level={estimate.level}
                    se={estimate.se}
                    target={profile.targetLevel}
                    observations={estimate.observations}
                  />

                  {descriptor ? (
                    <div className="grid grid-2">
                      <div className="stack stack-1">
                        <p className="eyebrow">What you can already do</p>
                        <p className="small">{descriptor.can}</p>
                      </div>
                      <div className="stack stack-1">
                        <p className="eyebrow">What is holding you here</p>
                        <p className="small">{descriptor.ceiling}</p>
                      </div>
                    </div>
                  ) : null}

                  {estimate.weakest.length ? (
                    <div className="stack stack-2">
                      <p className="eyebrow">Micro-skills below your own average</p>
                      <ul className="stack stack-2" style={{ listStyle: 'none', padding: 0 }}>
                        {estimate.weakest.map((weak) => {
                          const meta = tryMicroSkill(weak.microSkill);
                          return (
                            <li key={weak.microSkill} className="row-between">
                              <span className="small">{meta?.label ?? weak.microSkill}</span>
                              <span className="tiny faint numeric">
                                CLB {weak.theta.toFixed(1)} · {weak.gapToSkill.toFixed(1)} below your{' '}
                                {SKILL_LABELS[gap.skill].toLowerCase()}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}

                  {descriptor ? (
                    <div className="inset stack stack-2">
                      <p className="eyebrow">Highest-leverage change</p>
                      <p className="small">{descriptor.lever}</p>
                      <div className="row wrap">
                        {gap.skill === 'reading' || gap.skill === 'listening' ? (
                          <Link
                            className="btn btn-sm btn-primary"
                            href={
                              estimate.weakest[0]
                                ? `/practice/${gap.skill}?micro=${encodeURIComponent(estimate.weakest[0].microSkill)}`
                                : `/practice/${gap.skill}`
                            }
                          >
                            Practise this
                          </Link>
                        ) : (
                          <Link className="btn btn-sm btn-primary" href={`/${gap.skill}`}>
                            Practise this
                          </Link>
                        )}
                      </div>
                    </div>
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

      {/* --- Honest projection --- */}
      {overall ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="panel stack stack-4">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              What the distance actually costs
            </h2>
            {overall >= profile.targetLevel ? (
              <p className="small measure-wide">
                You are at target on the point estimates. Maintaining a level takes roughly a third of the practice
                that reaching it did — enough to keep the estimate current, not enough to let it drift.
              </p>
            ) : (
              <>
                <div className="grid grid-3">
                  <div className="stack stack-1">
                    <p className="eyebrow">Typical hours needed</p>
                    <p className="numeric" style={{ fontSize: '1.5rem' }}>
                      {hours}
                    </p>
                    <p className="tiny faint">
                      From CLB {overall.toFixed(1)} to {profile.targetLevel}
                    </p>
                  </div>
                  <div className="stack stack-1">
                    <p className="eyebrow">At your stated pace</p>
                    <p className="numeric" style={{ fontSize: '1.5rem' }}>
                      {weeksAtCurrentPace} weeks
                    </p>
                    <p className="tiny faint">
                      {profile.minutesPerDay} min × {profile.daysPerWeek} days
                    </p>
                  </div>
                  {profile.daysToExam !== null ? (
                    <div className="stack stack-1">
                      <p className="eyebrow">Until your test</p>
                      <p className="numeric" style={{ fontSize: '1.5rem' }}>
                        {Math.floor(profile.daysToExam / 7)} weeks
                      </p>
                      <p className="tiny faint">{profile.daysToExam} days</p>
                    </div>
                  ) : null}
                </div>

                {profile.daysToExam !== null && weeksAtCurrentPace !== null ? (
                  <p
                    className="small measure-wide"
                    style={{
                      color:
                        weeksAtCurrentPace > profile.daysToExam / 7 ? 'var(--caution)' : 'var(--ink-secondary)',
                    }}
                  >
                    {weeksAtCurrentPace > profile.daysToExam / 7
                      ? `At your current pace this target arrives about ${Math.ceil(weeksAtCurrentPace - profile.daysToExam / 7)} weeks after your test date. Meridian will not pretend otherwise: either add time per week, move the date, or aim at CLB ${Math.max(5, profile.targetLevel - 1)} first and treat ${profile.targetLevel} as the stretch.`
                      : 'Your pace and your test date are compatible, with room for the days you will inevitably miss.'}
                  </p>
                ) : null}

                <p className="tiny faint measure-wide">
                  These figures come from a published progression model in which each level costs more than the one
                  below it — moving 10 → 11 takes roughly twice the practice of 7 → 8. They are a planning aid, not
                  a promise, and they do not account for your starting point in each individual skill.
                </p>
              </>
            )}
          </div>
        </section>
      ) : null}

      {/* --- The ladder --- */}
      {measured.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              The levels above you
            </h2>
            <p className="tiny faint">What changes at each step</p>
          </div>
          <div className="stack stack-4">
            {(SKILLS as readonly Skill[]).slice(0, 2).map((skill) => {
              const estimate = profile.skills.find((s) => s.skill === skill)!;
              if (!estimate.observations) return null;
              const current = Math.floor(estimate.level);
              const ladder = LEVEL_DESCRIPTORS[skill].filter(
                (d) => d.level >= current && d.level <= profile.targetLevel,
              );
              if (ladder.length < 2) return null;
              return (
                <div key={skill} className="panel-quiet" data-skill={skill}>
                  <div className="stack stack-3">
                    <h3 className="row-tight" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      <span className="skill-mark" aria-hidden />
                      {SKILL_LABELS[skill]}
                    </h3>
                    <ol className="divide" style={{ listStyle: 'none', padding: 0 }}>
                      {ladder.map((step) => (
                        <li key={step.level} style={{ paddingBlock: 'var(--s3)' }}>
                          <div className="row" style={{ alignItems: 'flex-start', gap: 'var(--s4)' }}>
                            <span className="badge numeric" style={{ marginTop: '0.1rem' }}>
                              CLB {step.level}
                            </span>
                            <div className="stack stack-1">
                              <p className="small">{step.can}</p>
                              <p className="tiny muted">To move up: {step.lever}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* --- Today --- */}
      <section>
        <div className="panel stack stack-4">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Today’s highest-value work on this path
          </h2>
          {recommendations.length ? (
            <ul className="stack stack-3" style={{ listStyle: 'none', padding: 0 }}>
              {recommendations.slice(0, 3).map((rec) => (
                <li key={rec.href + rec.title} className="row-between wrap" data-skill={rec.skill}>
                  <div className="stack stack-1" style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 500 }}>{rec.title}</p>
                    <p className="small muted measure-wide">{rec.rationale}</p>
                  </div>
                  <Link className="btn btn-sm" href={rec.href}>
                    {rec.estimatedMinutes} min
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small muted">Complete the diagnostic to get recommendations.</p>
          )}
        </div>
      </section>
    </div>
  );
}
