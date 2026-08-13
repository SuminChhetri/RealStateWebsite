import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth/guard';
import { getProfile } from '@/lib/learner/profile';
import { startPractice } from '@/lib/practice/actions';
import { SKILL_LABELS, microSkillsFor, partsFor, type Skill } from '@/lib/content/taxonomy';
import { LevelScale } from '@/components/Level';

export const dynamic = 'force-dynamic';

const SUPPORTED = ['reading', 'listening'] as const;

export async function generateMetadata({ params }: { params: Promise<{ skill: string }> }): Promise<Metadata> {
  const { skill } = await params;
  return { title: `${SKILL_LABELS[skill as Skill] ?? 'Practice'} practice` };
}

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ skill: string }>;
  searchParams: Promise<{ micro?: string; pace?: string; mode?: string }>;
}) {
  const { skill } = await params;
  const query = await searchParams;
  if (!SUPPORTED.includes(skill as (typeof SUPPORTED)[number])) notFound();

  const session = await requireSession();
  const profile = getProfile(session.userId, session.orgId);
  const estimate = profile.skills.find((s) => s.skill === skill)!;
  const micros = microSkillsFor(skill as Skill);
  const parts = partsFor(skill as Skill);

  const estimatesByMicro = new Map(profile.microEstimates.map((m) => [m.microSkill, m]));
  const preselected = query.micro && micros.some((m) => m.slug === query.micro) ? query.micro : '';
  const examPace = query.pace === 'exam';

  const ranked = micros
    .map((m) => {
      const e = estimatesByMicro.get(m.slug);
      return {
        micro: m,
        theta: e?.theta ?? null,
        observations: e?.observations ?? 0,
        gap: e ? profile.targetLevel - e.theta : null,
      };
    })
    .sort((a, b) => (b.gap ?? -99) - (a.gap ?? -99));

  return (
    <div className="page">
      <header className="page-header" data-skill={skill}>
        <div className="stack stack-3">
          <p className="eyebrow row-tight">
            <span className="skill-mark" aria-hidden />
            {SKILL_LABELS[skill as Skill]} practice
          </p>
          <h1>Build a set</h1>
          <p className="muted measure-wide">
            Items are chosen for the difficulty where you currently get about two-thirds right. That is the range
            where the estimate moves fastest — easy sets tell the system nothing and hard sets tell you nothing.
          </p>
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', alignItems: 'start', gap: 'var(--s6)' }}>
        <form action={startPractice} className="panel stack stack-5">
          <input type="hidden" name="skill" value={skill} />
          <input type="hidden" name="mode" value={query.mode === 'section' ? 'section' : 'drill'} />

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-3">
            <legend className="eyebrow" style={{ padding: 0 }}>
              Focus
            </legend>
            <div className="choice-group">
              <label className="choice">
                <input type="radio" name="microSkill" value="" defaultChecked={!preselected} />
                Mixed — spread across the skill
              </label>
              {ranked.slice(0, 6).map(({ micro, theta, observations, gap }) => (
                <label className="choice" key={micro.slug}>
                  <input type="radio" name="microSkill" value={micro.slug} defaultChecked={preselected === micro.slug} />
                  <span>
                    {micro.label}
                    {observations > 0 ? (
                      <span className="tiny faint numeric" style={{ marginLeft: '0.35rem' }}>
                        CLB {theta!.toFixed(1)}
                        {gap !== null && gap > 0.8 ? ' · behind target' : ''}
                      </span>
                    ) : (
                      <span className="tiny faint" style={{ marginLeft: '0.35rem' }}>
                        not measured
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-3">
            <legend className="eyebrow" style={{ padding: 0 }}>
              Task type
            </legend>
            <div className="choice-group">
              <label className="choice">
                <input type="radio" name="partType" value="" defaultChecked />
                Any
              </label>
              {parts.map((part) => (
                <label className="choice" key={part.slug}>
                  <input type="radio" name="partType" value={part.slug} />
                  {part.label.replace(/^(Reading|Listening) /, '')}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-3">
            <legend className="eyebrow" style={{ padding: 0 }}>
              Length
            </legend>
            <div className="choice-group">
              {[6, 8, 12, 20].map((n, i) => (
                <label className="choice" key={n}>
                  <input type="radio" name="count" value={n} defaultChecked={i === 1} />
                  {n} items
                </label>
              ))}
            </div>
          </fieldset>

          <div className="stack stack-3">
            <label className="choice" style={{ alignSelf: 'flex-start' }}>
              <input type="checkbox" name="timed" defaultChecked={examPace} />
              Exam pace — a clock, and audio plays once
            </label>
            <p className="hint measure">
              Untimed practice is for learning a method. Timed practice is for proving you can use it under
              pressure. Meridian tracks the two separately, because the gap between them is a finding in itself.
            </p>
          </div>

          <button className="btn btn-primary btn-lg" type="submit">
            Build the set
          </button>
        </form>

        <aside className="stack stack-5">
          <div className="panel-quiet stack stack-4" data-skill={skill}>
            <p className="eyebrow">Your {SKILL_LABELS[skill as Skill].toLowerCase()}</p>
            <LevelScale
              level={estimate.level}
              se={estimate.se}
              target={profile.targetLevel}
              observations={estimate.observations}
            />
            {estimate.observations > 0 ? (
              <p className="small muted">
                Based on {estimate.observations} item{estimate.observations === 1 ? '' : 's'} across{' '}
                {Math.round(estimate.coverage * 100)}% of this skill’s micro-skills.
              </p>
            ) : null}
          </div>

          <div className="panel-quiet stack stack-3">
            <p className="eyebrow">Where you are behind</p>
            {ranked.filter((r) => r.gap !== null && r.gap > 0.5).length ? (
              <ul className="stack stack-3" style={{ listStyle: 'none', padding: 0 }}>
                {ranked
                  .filter((r) => r.gap !== null && r.gap > 0.5)
                  .slice(0, 4)
                  .map(({ micro, theta, gap }) => (
                    <li key={micro.slug} className="stack stack-1">
                      <div className="row-between">
                        <span className="small" style={{ fontWeight: 500 }}>
                          {micro.label}
                        </span>
                        <span className="tiny numeric muted">
                          CLB {theta!.toFixed(1)} · {gap!.toFixed(1)} behind
                        </span>
                      </div>
                      <p className="tiny muted">{micro.discriminator}</p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="small muted">
                Not enough evidence yet. A mixed set of eight items will place three or four micro-skills.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
