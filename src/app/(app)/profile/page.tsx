import type { Metadata } from 'next';
import Link from 'next/link';
import { and, eq, sql } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import {
  attemptItems,
  attempts,
  evaluations,
  learnerProfiles,
  lessonProgress,
  mistakes,
  organizations,
  reviewCards,
  speakingSubmissions,
  users,
  writingSubmissions,
} from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { ThemePicker } from '@/components/ThemePicker';
import { DangerZone } from './DangerZone';
import { deleteAccount, saveTheme, updateProfile } from './actions';
import { DEFAULT_THEME, isThemeKey } from '@/lib/theme';
import './profile.css';

export const metadata: Metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

/**
 * The profile page.
 *
 * It answers three questions and nothing else: who am I here, how much work
 * have I actually done, and how do I change or end this. Preferences that
 * shape the *plan* — target level, test date, availability — stay in Settings,
 * because those are study decisions rather than account ones.
 *
 * Every figure below is counted from the learner's own rows. There are no
 * badges for signing up and no streak inflation: a number that can be earned
 * without doing the work is a number that stops meaning anything.
 */
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireSession();
  const query = await searchParams;
  const profile = await getProfile(session.userId, session.orgId);

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, session.orgId))
    .limit(1);
  const [prefs] = await db
    .select()
    .from(learnerProfiles)
    .where(and(eq(learnerProfiles.userId, session.userId), eq(learnerProfiles.orgId, session.orgId)))
    .limit(1);

  const scope = and(eq(attempts.userId, session.userId), eq(attempts.orgId, session.orgId));

  const [answered] = await db
    .select({
      items: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${attemptItems.correct} is true then 1 else 0 end)::int`,
      seconds: sql<number>`coalesce(sum(${attemptItems.elapsedMs}), 0)::bigint / 1000`,
    })
    .from(attemptItems)
    .innerJoin(attempts, eq(attempts.id, attemptItems.attemptId))
    .where(and(scope, sql`${attemptItems.answeredAt} is not null`));

  const [sets] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attempts)
    .where(and(scope, sql`${attempts.completedAt} is not null`));

  const counts = await Promise.all(
    (
      [
        [writingSubmissions, writingSubmissions.userId, writingSubmissions.orgId],
        [speakingSubmissions, speakingSubmissions.userId, speakingSubmissions.orgId],
        [lessonProgress, lessonProgress.userId, lessonProgress.orgId],
        [mistakes, mistakes.userId, mistakes.orgId],
        [reviewCards, reviewCards.userId, reviewCards.orgId],
        [evaluations, evaluations.userId, evaluations.orgId],
      ] as const
    ).map(async ([table, userCol, orgCol]) => {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(table)
        .where(and(eq(userCol, session.userId), eq(orgCol, session.orgId)));
      return row?.count ?? 0;
    }),
  );
  const [written, spoken, lessonsDone, mistakeCount, cards, evaluationCount] = counts;

  const itemsAnswered = answered?.items ?? 0;
  const accuracy = itemsAnswered ? Math.round(((answered?.correct ?? 0) / itemsAnswered) * 100) : null;
  const minutes = Math.round(Number(answered?.seconds ?? 0) / 60);
  const theme = isThemeKey(prefs?.theme) ? prefs.theme : DEFAULT_THEME;

  const initials = (user?.name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const joined = user?.createdAt
    ? new Date(user.createdAt * 1000).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const stats: { label: string; value: string; note: string }[] = [
    {
      label: 'Items answered',
      value: itemsAnswered.toLocaleString('en-CA'),
      note: accuracy === null ? 'No answers yet' : `${accuracy}% correct overall`,
    },
    {
      label: 'Sets completed',
      value: String(sets?.count ?? 0),
      note: 'Practice sets, sections and mock sittings',
    },
    {
      label: 'Time on task',
      value: minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`,
      note: 'Measured per item, not per page open',
    },
    {
      label: 'Responses produced',
      value: String(written + spoken),
      note: `${written} written, ${spoken} spoken`,
    },
    {
      label: 'Lessons finished',
      value: String(lessonsDone),
      note: 'Worked through to the last checkpoint',
    },
    {
      label: 'Cards scheduled',
      value: String(cards),
      note: `${mistakeCount} mistake${mistakeCount === 1 ? '' : 's'} tracked, ${evaluationCount} evaluation${evaluationCount === 1 ? '' : 's'}`,
    },
  ];

  return (
    <div className="page-narrow">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Profile</p>
          <div className="profile-identity">
            <span className="profile-avatar" aria-hidden>
              {initials || '·'}
            </span>
            <div className="stack stack-1" style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.65rem' }}>{user?.name}</h1>
              <p className="small muted profile-email">{user?.email}</p>
              {joined ? <p className="tiny faint">Joined {joined}</p> : null}
            </div>
          </div>
        </div>
      </header>

      {query.saved ? (
        <p className="notice notice-positive" role="status">
          Saved.
        </p>
      ) : null}
      {query.error === 'confirm' ? (
        <p className="notice notice-critical" role="alert">
          The email address did not match, so nothing was deleted.
        </p>
      ) : null}
      {query.error === 'rate' ? (
        <p className="notice notice-critical" role="alert">
          Too many attempts. Wait an hour and try again.
        </p>
      ) : null}
      {query.error === 'name' ? (
        <p className="notice notice-critical" role="alert">
          A name is required.
        </p>
      ) : null}

      {/* --- What you have actually done --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Your record</h2>
          <p className="tiny faint">Counted from your own work</p>
        </div>
        <ul className="profile-stats">
          {stats.map((stat) => (
            <li key={stat.label} className="profile-stat">
              <span className="profile-stat-value serif numeric">{stat.value}</span>
              <span className="small" style={{ fontWeight: 500 }}>
                {stat.label}
              </span>
              <span className="tiny faint">{stat.note}</span>
            </li>
          ))}
        </ul>
        <p className="tiny faint" style={{ marginTop: 'var(--s3)' }}>
          Current streak: {profile.streakDays} day{profile.streakDays === 1 ? '' : 's'}. A day counts when you
          finish something, not when you open the page.
        </p>
      </section>

      {/* --- Appearance --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Appearance</h2>
          <p className="tiny faint">Applies immediately</p>
        </div>
        <p className="small muted measure-wide" style={{ marginBottom: 'var(--s4)' }}>
          You will read passages here for fifty minutes at a stretch, sometimes late. That makes this a
          reading-comfort setting rather than a decoration — pick whichever you can stay in longest.
        </p>
        <ThemePicker current={theme} saveAction={saveTheme} />
      </section>

      {/* --- Account --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Account</h2>
        </div>
        <form action={updateProfile} className="stack stack-4">
          <div className="field">
            <label htmlFor="name">
              Display name
            </label>
            <input
              className="input"
              id="name"
              name="name"
              defaultValue={user?.name ?? ''}
              maxLength={80}
              required
              style={{ maxWidth: '22rem' }}
            />
          </div>
          <div className="field">
            <label htmlFor="email">
              Email
            </label>
            <input
              className="input"
              id="email"
              value={user?.email ?? ''}
              readOnly
              disabled
              style={{ maxWidth: '22rem' }}
            />
            <p className="tiny faint">
              Your email is your sign-in and cannot be changed here yet.
            </p>
          </div>
          <div>
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </div>
        </form>

        <p className="small muted" style={{ marginTop: 'var(--s5)' }}>
          Workspace: <strong>{org?.name}</strong>. Your target level, test date and daily availability live in{' '}
          <Link href="/settings">Settings</Link>, since those shape the study plan rather than the account.
        </p>
      </section>

      {/* --- The irreversible one --- */}
      <DangerZone email={user?.email ?? ''} deleteAction={deleteAccount} />
    </div>
  );
}
