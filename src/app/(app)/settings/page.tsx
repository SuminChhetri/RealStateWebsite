import type { Metadata } from 'next';
import { and, eq, sql } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import {
  attempts,
  evaluations,
  learnerProfiles,
  mistakes,
  reviewCards,
  skillEstimates,
} from '@/lib/db/schema';
import { getProfile } from '@/lib/learner/profile';
import { updateSettings } from './actions';
import { entitlements } from '@/lib/providers';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const query = await searchParams;
  const session = await requireSession();
  const profile = getProfile(session.userId, session.orgId);
  const row = db
    .select()
    .from(learnerProfiles)
    .where(and(eq(learnerProfiles.userId, session.userId), eq(learnerProfiles.orgId, session.orgId)))
    .get()!;

  const counts = {
    attempts: db
      .select({ c: sql<number>`count(*)` })
      .from(attempts)
      .where(and(eq(attempts.userId, session.userId), eq(attempts.orgId, session.orgId)))
      .get()?.c ?? 0,
    evaluations: db
      .select({ c: sql<number>`count(*)` })
      .from(evaluations)
      .where(and(eq(evaluations.userId, session.userId), eq(evaluations.orgId, session.orgId)))
      .get()?.c ?? 0,
    estimates: db
      .select({ c: sql<number>`count(*)` })
      .from(skillEstimates)
      .where(and(eq(skillEstimates.userId, session.userId), eq(skillEstimates.orgId, session.orgId)))
      .get()?.c ?? 0,
    mistakes: db
      .select({ c: sql<number>`count(*)` })
      .from(mistakes)
      .where(and(eq(mistakes.userId, session.userId), eq(mistakes.orgId, session.orgId)))
      .get()?.c ?? 0,
    cards: db
      .select({ c: sql<number>`count(*)` })
      .from(reviewCards)
      .where(and(eq(reviewCards.userId, session.userId), eq(reviewCards.orgId, session.orgId)))
      .get()?.c ?? 0,
  };

  const plan = entitlements('learner_free');
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page-narrow">
      <header className="page-header">
        <div className="stack stack-2">
          <p className="eyebrow">Settings</p>
          <h1>Your target and your time</h1>
        </div>
      </header>

      {query.saved ? (
        <p className="badge badge-positive" style={{ marginBottom: 'var(--s5)' }}>
          Saved — your plan and recommendations have been rebuilt.
        </p>
      ) : null}

      <form action={updateSettings} className="stack stack-6">
        <section className="stack stack-3">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Target level</h2>
          <div className="choice-group">
            {[7, 8, 9, 10, 11, 12].map((level) => (
              <label className="choice" key={level}>
                <input type="radio" name="targetLevel" value={level} defaultChecked={level === row.targetLevel} />
                CLB {level}
              </label>
            ))}
          </div>
        </section>

        <section className="stack stack-3">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Test date</h2>
          <div className="field" style={{ maxWidth: '14rem' }}>
            <label htmlFor="examDate">Date</label>
            <input
              className="input"
              type="date"
              id="examDate"
              name="examDate"
              min={today}
              defaultValue={row.examDate ?? ''}
            />
            <p className="hint">Clear the field if your date has changed or has not been booked.</p>
          </div>
        </section>

        <section className="stack stack-3">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Availability</h2>
          <div className="grid grid-2">
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack stack-2">
              <legend className="eyebrow" style={{ padding: 0 }}>
                Minutes per study day
              </legend>
              <div className="choice-group">
                {[20, 30, 45, 60, 90].map((m) => (
                  <label className="choice" key={m}>
                    <input type="radio" name="minutesPerDay" value={m} defaultChecked={m === row.minutesPerDay} />
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
                    <input type="radio" name="daysPerWeek" value={d} defaultChecked={d === row.daysPerWeek} />
                    {d}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start' }}>
          Save
        </button>
      </form>

      <section style={{ marginTop: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            What Meridian stores about you
          </h2>
        </div>
        <div className="panel-quiet stack stack-4">
          <div className="table-wrap">
            <table className="data">
              <tbody>
                <tr>
                  <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem', color: 'var(--ink)' }}>
                    Practice attempts
                  </th>
                  <td className="num">{counts.attempts}</td>
                </tr>
                <tr>
                  <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem', color: 'var(--ink)' }}>
                    Writing and speaking evaluations
                  </th>
                  <td className="num">{counts.evaluations}</td>
                </tr>
                <tr>
                  <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem', color: 'var(--ink)' }}>
                    Micro-skill estimates
                  </th>
                  <td className="num">{counts.estimates}</td>
                </tr>
                <tr>
                  <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem', color: 'var(--ink)' }}>
                    Recorded mistakes
                  </th>
                  <td className="num">{counts.mistakes}</td>
                </tr>
                <tr>
                  <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem', color: 'var(--ink)' }}>
                    Scheduled review cards
                  </th>
                  <td className="num">{counts.cards}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="small muted measure-wide">
            Everything above exists because a feature needs it: the estimates drive recommendations, the mistakes
            drive retests, the cards drive the review queue. Nothing is collected for analytics, and audio
            recordings are stored on the machine running this application, not sent anywhere.
          </p>
        </div>
      </section>

      <section style={{ marginTop: 'var(--s6)' }}>
        <div className="panel-quiet stack stack-3">
          <p className="eyebrow">Workspace</p>
          <p className="small">
            {session.orgName} · {session.role} · plan: {plan.name}
          </p>
          <p className="tiny faint measure-wide">
            Meridian is built multi-tenant from the schema up: every row of your data is scoped to this workspace,
            and the authorisation check happens on the server for every request. Team and institution features use
            the same structures, with no billing provider connected.
          </p>
        </div>
      </section>
    </div>
  );
}
