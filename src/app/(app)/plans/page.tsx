import type { Metadata } from 'next';
import Link from 'next/link';
import { currentPlan, requireSession } from '@/lib/auth/guard';
import { BILLING_PROVIDER_CONNECTED, PLANS } from '@/lib/billing/plans';

export const metadata: Metadata = { title: 'Plans' };
export const dynamic = 'force-dynamic';

/**
 * The plans page.
 *
 * Written in outcomes rather than feature names, and it leads with what is free
 * rather than what is paid. That ordering is deliberate: "unlimited" and "free
 * forever" are what every test-prep site says before the paywall appears at the
 * point of value, and the answer to that suspicion is not more reassurance — it
 * is stating plainly what happens if someone never pays.
 *
 * There are no countdown timers here, no manufactured scarcity, and no
 * comparison table engineered to make the free column look broken.
 */
export default async function PlansPage() {
  const session = await requireSession();
  const plan = await currentPlan(session);

  return (
    <div className="page-narrow">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Plans</p>
          <h1>What is free, and what is not</h1>
          <p className="muted measure-wide">
            You are on <strong>{plan.name}</strong>.
          </p>
        </div>
      </header>

      {/* The commitment, stated before the pitch. */}
      <section className="panel stack stack-4" style={{ marginBottom: 'var(--s7)', borderLeft: '3px solid var(--positive)' }}>
        <p className="eyebrow">Free, permanently</p>
        <p className="small measure-wide">
          A free account is a complete product, not a trial. The whole method stays free: the diagnostic,
          unlimited adaptive practice, every explanation and distractor rationale, your mistake bank, spaced
          review, all lessons, and full writing and speaking analysis with all nine dimensions.
        </p>
        <ul className="stack stack-2" style={{ paddingLeft: '1.1rem' }}>
          <li className="small">
            <strong>The truth is never charged for.</strong> Uncertainty bands, declared limitations, and the
            reasoning behind every recommendation are free — including the parts you would rather not read.
            Charging someone to be told the truth about their own performance is how test preparation loses the
            right to be believed.
          </li>
          <li className="small">
            <strong>Your history is yours.</strong> Nothing you have done is ever locked behind a plan, and full
            data export is free at every tier.
          </li>
          <li className="small">
            <strong>Practice is not rationed.</strong> There is no cap on sets, sections or mock sittings, and
            there will not be one.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>The plans</h2>
        </div>
        <div className="stack stack-4">
          {PLANS.map((entry) => {
            const isCurrent = entry.key === plan.key;
            return (
              <article
                key={entry.key}
                className="panel"
                style={isCurrent ? { borderLeft: '3px solid var(--accent)' } : undefined}
              >
                <div className="stack stack-3">
                  <div className="row-between wrap">
                    <h3 className="row-tight" style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      {entry.name}
                      {isCurrent ? <span className="badge badge-accent">Your plan</span> : null}
                    </h3>
                    <span className="tiny faint">
                      {entry.audience === 'organisation' ? `Up to ${entry.seats} seats` : 'One person'}
                    </span>
                  </div>
                  <p className="small measure-wide">{entry.summary}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {!BILLING_PROVIDER_CONNECTED ? (
        <section className="panel-quiet stack stack-3">
          <p className="eyebrow">About upgrading</p>
          <p className="small measure-wide">
            No payment provider is connected to this build, so there is nothing to buy and no checkout to start.
            Presenting one that could not complete would be a lie about what the software does — the same
            mistake as reporting a score the product cannot measure.
          </p>
          <p className="small muted measure-wide">
            The entitlement model is real and enforced on the server: connecting a provider means setting a
            plan on the organisation and changing nothing else.
          </p>
          <p className="tiny faint">
            <Link href="/profile">Back to your profile</Link>
          </p>
        </section>
      ) : null}
    </div>
  );
}
