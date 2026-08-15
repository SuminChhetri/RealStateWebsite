/**
 * Plans and entitlements.
 *
 * One module answers "may this account use this", and it answers on the server.
 * Hiding a link in the interface is presentation, not access control — a
 * paywall that is enforced in six places leaks in at least one of them.
 *
 * The reasoning behind the tier boundaries is in `docs/MONETISATION.md`. The
 * short version, because it constrains what may be added here later:
 *
 *   1. The truth is never charged for. Limitations, uncertainty, honest
 *      verdicts and the reasoning behind a recommendation are free.
 *   2. The learning loop is never broken. Diagnose, practise, get feedback,
 *      review, retest — all free, permanently, without limits.
 *   3. Paid buys depth, evidence and other people.
 *   4. Data portability is free. Someone's own record is theirs.
 *
 * **No payment provider is connected.** Connecting one means writing `planKey`
 * on the organisation from a webhook and changing nothing else in the product.
 */

export type FeatureKey =
  /* Free — the loop. */
  | 'diagnostic'
  | 'practice'
  | 'feedback'
  | 'mistakes'
  | 'review'
  | 'lessons'
  | 'evaluation'
  | 'plan'
  | 'mock'
  | 'progress'
  | 'data_export'
  /* Pro — depth and evidence. */
  | 'readiness_report'
  | 'sitting_report'
  | 'sitting_comparison'
  | 'calendar_export'
  | 'micro_drilldown'
  /* Institute — other people. */
  | 'cohorts'
  | 'teacher_review'
  | 'seat_management';

/** Everything free, in one list, so the plans page cannot drift from the code. */
export const FREE_FEATURES: FeatureKey[] = [
  'diagnostic',
  'practice',
  'feedback',
  'mistakes',
  'review',
  'lessons',
  'evaluation',
  'plan',
  'mock',
  'progress',
  'data_export',
];

const PRO_FEATURES: FeatureKey[] = [
  ...FREE_FEATURES,
  'readiness_report',
  'sitting_report',
  'sitting_comparison',
  'calendar_export',
  'micro_drilldown',
];

export interface Plan {
  key: string;
  name: string;
  audience: 'individual' | 'organisation';
  /** What a learner gets, in outcomes rather than feature names. */
  summary: string;
  seats: number;
  features: FeatureKey[];
}

export const PLANS: Plan[] = [
  {
    key: 'learner_free',
    name: 'Learner',
    audience: 'individual',
    summary:
      'The whole method, permanently. Diagnose what is holding you back, practise at the right difficulty without limit, and get every explanation, every correction and every scheduled review.',
    seats: 1,
    features: FREE_FEATURES,
  },
  {
    key: 'learner_pro',
    name: 'Learner Pro',
    audience: 'individual',
    summary:
      'For the month before a booked test. Everything in Learner, plus the artefacts: a printable readiness report you can hand to a tutor, forensic reports on each mock sitting, a side-by-side comparison that separates real movement from noise, and your study plan on your own calendar.',
    seats: 1,
    features: PRO_FEATURES,
  },
  {
    key: 'institute',
    name: 'Institute',
    audience: 'organisation',
    summary:
      'For teachers running a cohort. Everything in Learner Pro for every seat, plus a cohort view, a teacher review queue, and exportable cohort reports.',
    seats: 50,
    features: [...PRO_FEATURES, 'cohorts', 'teacher_review', 'seat_management'],
  },
];

export const DEFAULT_PLAN_KEY = 'learner_free';

export function planFor(planKey: string | null | undefined): Plan {
  return PLANS.find((plan) => plan.key === planKey) ?? PLANS[0];
}

export function hasFeature(planKey: string | null | undefined, feature: FeatureKey): boolean {
  return planFor(planKey).features.includes(feature);
}

/** The lowest plan that includes a feature — what a refusal should name. */
export function planRequiredFor(feature: FeatureKey): Plan | null {
  return PLANS.find((plan) => plan.features.includes(feature)) ?? null;
}

/**
 * Whether upgrading is worth mentioning yet.
 *
 * The people who benefit from the paid artefacts are not browsing casually —
 * they are a few weeks out with a booked test. Showing an upgrade prompt to
 * someone in their first week is selling to the wrong person and reads as a
 * nag, so the prompt is contextual rather than permanent.
 */
export function upgradeIsRelevant(input: {
  planKey: string | null | undefined;
  daysToExam: number | null;
  completedSets: number;
}): boolean {
  if (hasFeature(input.planKey, 'readiness_report')) return false;
  if (input.daysToExam !== null && input.daysToExam <= 42) return true;
  return input.completedSets >= 8;
}

/** Whether billing can actually be transacted. It cannot, and the UI says so. */
export const BILLING_PROVIDER_CONNECTED = false;
