import Link from 'next/link';
import type { Plan, FeatureKey } from '@/lib/billing/plans';

/**
 * What a learner sees when a feature is not on their plan.
 *
 * The most common support ticket about any paywall is "I paid and I still
 * cannot see X", and it is caused by refusals that do not explain themselves.
 * So this names the plan the account is actually on, the plan the feature
 * needs, and where to compare them — rather than showing a generic upsell that
 * leaves someone guessing which of those two facts is wrong.
 *
 * This is presentation. The gate is `checkFeature` on the server; hiding a link
 * is not access control.
 */
export function LockedFeature({
  currentPlan,
  requiredPlan,
  what,
}: {
  feature: FeatureKey;
  currentPlan: Plan;
  requiredPlan: Plan | null;
  what: string;
}) {
  return (
    <section className="panel stack stack-4" style={{ borderLeft: '3px solid var(--accent)' }}>
      <div className="stack stack-2">
        <p className="eyebrow">Not on your plan</p>
        <h2 style={{ fontSize: '1.15rem' }}>
          {what.charAt(0).toUpperCase() + what.slice(1)} needs {requiredPlan?.name ?? 'a paid plan'}
        </h2>
      </div>

      <p className="small measure-wide">
        Your account is on <strong>{currentPlan.name}</strong>, which does not include {what}. Everything you
        use to actually improve — the diagnostic, unlimited practice, every explanation, your mistake bank,
        review scheduling, lessons, and writing and speaking analysis — stays on {currentPlan.name} and is not
        affected by this.
      </p>

      <div className="row-tight wrap">
        <Link className="btn btn-primary" href="/plans">
          Compare plans
        </Link>
        <Link className="btn" href="/home">
          Back to today
        </Link>
      </div>
    </section>
  );
}
