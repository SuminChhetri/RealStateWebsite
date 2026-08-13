import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth/guard';
import { getProfile } from '@/lib/learner/profile';
import { completeOnboarding } from './actions';

export const metadata: Metadata = { title: 'Set your target' };
export const dynamic = 'force-dynamic';

const CONFIDENCE = [
  { value: 1, label: 'Struggling' },
  { value: 2, label: 'Shaky' },
  { value: 3, label: 'Mixed' },
  { value: 4, label: 'Solid' },
  { value: 5, label: 'Strong' },
];

/**
 * Onboarding asks six questions and nothing more. Every one of them changes
 * what the product does next: the target sets the gap, the date sets the
 * schedule, the availability sets the daily load, and the self-ratings give
 * the diagnostic a starting difficulty. Anything that would not change
 * behaviour is not asked.
 */
export default async function OnboardingPage() {
  const session = await requireSession();
  const profile = getProfile(session.userId, session.orgId);
  if (profile.onboarded) redirect('/home');

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main id="main" className="page-narrow">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Step 1 of 2</p>
          <h1>What are you aiming at?</h1>
          <p className="muted measure-wide">
            Six questions. Each one changes what Meridian does next — none of them are for a mailing list. After
            this comes a 25-minute diagnostic, and from then on the product is built around what it finds.
          </p>
        </div>
      </header>

      <form action={completeOnboarding} className="stack stack-6">
        <section className="stack stack-3">
          <div className="stack stack-1">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Your target level
            </h2>
            <p className="small muted">
              CELPIP results map onto the Canadian Language Benchmarks. Most immigration streams ask for CLB 7 to
              9; CLB 10+ is where the top of the scale begins.
            </p>
          </div>
          <div className="choice-group">
            {[7, 8, 9, 10, 11, 12].map((level) => (
              <label className="choice" key={level}>
                <input type="radio" name="targetLevel" value={level} defaultChecked={level === 10} required />
                CLB {level}
              </label>
            ))}
          </div>
        </section>

        <section className="stack stack-3">
          <div className="stack stack-1">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Your test date
            </h2>
            <p className="small muted">
              If you have one, the plan works backwards from it and schedules a full simulation three days before.
              Leave it blank if you have not booked yet.
            </p>
          </div>
          <div className="field" style={{ maxWidth: '14rem' }}>
            <label htmlFor="examDate">Date</label>
            <input className="input" type="date" id="examDate" name="examDate" min={today} />
          </div>
        </section>

        <section className="stack stack-3">
          <div className="stack stack-1">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              How much time you actually have
            </h2>
            <p className="small muted">
              Be honest rather than ambitious. A plan built on 30 real minutes beats one built on 90 imagined ones.
            </p>
          </div>
          <div className="grid grid-2">
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-2">
              <legend className="eyebrow" style={{ padding: 0 }}>
                Minutes per study day
              </legend>
              <div className="choice-group">
                {[20, 30, 45, 60, 90].map((m) => (
                  <label className="choice" key={m}>
                    <input type="radio" name="minutesPerDay" value={m} defaultChecked={m === 45} required />
                    {m}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-2">
              <legend className="eyebrow" style={{ padding: 0 }}>
                Days per week
              </legend>
              <div className="choice-group">
                {[2, 3, 4, 5, 6, 7].map((d) => (
                  <label className="choice" key={d}>
                    <input type="radio" name="daysPerWeek" value={d} defaultChecked={d === 5} required />
                    {d}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section className="stack stack-3">
          <div className="stack stack-1">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              How each skill feels right now
            </h2>
            <p className="small muted">
              This is never used as a score. It sets the starting difficulty of the diagnostic, and later Meridian
              shows you where your sense of a skill and your performance disagree — which is often the most useful
              thing on the page.
            </p>
          </div>
          <div className="stack stack-4">
            {(
              [
                ['confidenceReading', 'Reading'],
                ['confidenceListening', 'Listening'],
                ['confidenceWriting', 'Writing'],
                ['confidenceSpeaking', 'Speaking'],
              ] as const
            ).map(([name, label]) => (
              <fieldset key={name} style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-2">
                <legend className="small" style={{ fontWeight: 600, padding: 0 }}>
                  {label}
                </legend>
                <div className="choice-group">
                  {CONFIDENCE.map((c) => (
                    <label className="choice" key={c.value}>
                      <input type="radio" name={name} value={c.value} defaultChecked={c.value === 3} required />
                      {c.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section className="stack stack-3">
          <div className="grid grid-2">
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-2">
              <legend className="eyebrow" style={{ padding: 0 }}>
                Why you are taking it
              </legend>
              <div className="choice-group">
                {(
                  [
                    ['immigration', 'Immigration'],
                    ['citizenship', 'Citizenship'],
                    ['professional', 'Professional'],
                    ['academic', 'Academic'],
                    ['personal', 'Personal'],
                  ] as const
                ).map(([value, label]) => (
                  <label className="choice" key={value}>
                    <input type="radio" name="goalContext" value={value} defaultChecked={value === 'immigration'} required />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-2">
              <legend className="eyebrow" style={{ padding: 0 }}>
                Previous attempts
              </legend>
              <div className="choice-group">
                {[0, 1, 2, 3].map((n) => (
                  <label className="choice" key={n}>
                    <input type="radio" name="priorAttempts" value={n} defaultChecked={n === 0} required />
                    {n === 3 ? '3 or more' : n}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <div className="row wrap">
          <button className="btn btn-primary btn-lg" type="submit">
            Continue to the diagnostic
          </button>
          <p className="small muted">Takes about 25 minutes. You can pause between items.</p>
        </div>
      </form>
    </main>
  );
}
