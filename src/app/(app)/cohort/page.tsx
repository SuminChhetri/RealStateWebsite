import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { checkFeature, requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import {
  attemptItems,
  attempts,
  learnerProfiles,
  memberships,
  mistakes,
  skillEstimates,
  users,
  writingSubmissions,
} from '@/lib/db/schema';
import { LockedFeature } from '@/components/LockedFeature';
import { SKILLS, SKILL_LABELS, tryMicroSkill, type Skill } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Cohort' };
export const dynamic = 'force-dynamic';

/**
 * The teacher's view of a cohort.
 *
 * A teacher with twenty learners does not have twenty hours to read twenty
 * profiles. They have ten minutes before a class and three questions: who has
 * stopped working, who is furthest from their target, and what does this group
 * have in common that I could teach to the whole room.
 *
 * That third question is the one this view exists for. A per-learner list is
 * something any product can build; finding the micro-skill that eleven of
 * twenty people are weak on — and which is therefore worth an hour of class
 * time rather than twenty separate conversations — is what the micro-skill
 * taxonomy makes possible and what a teacher would actually pay for.
 *
 * Tenancy is not relaxed here. Every query is scoped to the session's
 * organisation, and the feature is gated behind the plan *and* the role.
 */
export default async function CohortPage() {
  const session = await requireSession();
  const gate = await checkFeature(session, 'cohorts');

  if (!gate.allowed) {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Cohort</p>
            <h1>What should this class spend an hour on?</h1>
            <p className="muted measure-wide">
              Every learner in your organisation against their target, who has gone quiet, and — the part that
              matters — the micro-skills the group shares, so one hour of teaching reaches everybody who needs
              it instead of twenty separate conversations.
            </p>
          </div>
        </header>
        <LockedFeature
          feature="cohorts"
          currentPlan={gate.plan}
          requiredPlan={gate.required}
          what="the cohort view"
        />
      </div>
    );
  }

  // A plan can include cohorts while an individual account is still a learner.
  // The plan says the organisation may; the role says whether this person may.
  if (session.role === 'learner') {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Cohort</p>
            <h1>Not available to your account</h1>
          </div>
        </header>
        <p className="notice notice-caution">
          Your organisation is on a plan that includes the cohort view, but your role is <strong>learner</strong>
          . An owner or admin can change that in the organisation&rsquo;s membership settings.
        </p>
      </div>
    );
  }

  const members = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      role: memberships.role,
      targetLevel: learnerProfiles.targetLevel,
      examDate: learnerProfiles.examDate,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .leftJoin(
      learnerProfiles,
      and(eq(learnerProfiles.userId, memberships.userId), eq(learnerProfiles.orgId, session.orgId)),
    )
    // Everyone in the organisation, not only members whose role is literally
    // "learner". An owner or teacher who also studies has a profile and belongs
    // on this list; filtering by role meant a solo account — and every account
    // is solo until someone is invited — saw an empty table and no explanation.
    .where(eq(memberships.orgId, session.orgId));

  const ids = members.map((m) => m.userId);

  const [estimateRows, lastActivity, mistakeRows, writingCounts] = ids.length
    ? await Promise.all([
        db
          .select({
            userId: skillEstimates.userId,
            skill: skillEstimates.skill,
            theta: skillEstimates.theta,
            microSkill: skillEstimates.microSkill,
            observations: skillEstimates.observations,
          })
          .from(skillEstimates)
          .where(and(eq(skillEstimates.orgId, session.orgId), inArray(skillEstimates.userId, ids))),
        db
          .select({ userId: attempts.userId, last: sql<number>`max(${attempts.startedAt})::int` })
          .from(attempts)
          .where(and(eq(attempts.orgId, session.orgId), inArray(attempts.userId, ids)))
          .groupBy(attempts.userId),
        db
          .select({ userId: mistakes.userId, count: sql<number>`count(*)::int` })
          .from(mistakes)
          .where(
            and(
              eq(mistakes.orgId, session.orgId),
              inArray(mistakes.userId, ids),
              sql`${mistakes.resolvedAt} is null`,
            ),
          )
          .groupBy(mistakes.userId),
        db
          .select({ userId: writingSubmissions.userId, count: sql<number>`count(*)::int` })
          .from(writingSubmissions)
          .where(and(eq(writingSubmissions.orgId, session.orgId), inArray(writingSubmissions.userId, ids)))
          .groupBy(writingSubmissions.userId),
      ])
    : [[], [], [], []];

  const lastByUser = new Map(lastActivity.map((r) => [r.userId, r.last]));
  const mistakesByUser = new Map(mistakeRows.map((r) => [r.userId, r.count]));
  const writingByUser = new Map(writingCounts.map((r) => [r.userId, r.count]));

  const now = Math.floor(Date.now() / 1000);

  // Per learner: the mean of their skill-level estimates, and the gap to target.
  const perLearner = members
    .map((member) => {
      const own = estimateRows.filter((row) => row.userId === member.userId && row.observations > 0);
      const bySkill = SKILLS.map((skill) => {
        const rows = own.filter((r) => r.skill === skill);
        if (!rows.length) return null;
        return rows.reduce((sum, r) => sum + r.theta, 0) / rows.length;
      });
      const measured = bySkill.filter((v): v is number => v !== null);
      const overall = measured.length ? measured.reduce((a, b) => a + b, 0) / measured.length : null;
      const target = member.targetLevel ?? 9;
      const last = lastByUser.get(member.userId) ?? null;
      return {
        ...member,
        target,
        overall,
        gap: overall === null ? null : target - overall,
        skillsMeasured: measured.length,
        daysQuiet: last ? Math.floor((now - last) / 86400) : null,
        openMistakes: mistakesByUser.get(member.userId) ?? 0,
        written: writingByUser.get(member.userId) ?? 0,
      };
    })
    .sort((a, b) => (b.gap ?? -99) - (a.gap ?? -99));

  /* ---- What the group has in common ---- */
  const microTotals = new Map<string, { learners: Set<string>; theta: number; count: number }>();
  for (const row of estimateRows) {
    if (row.observations < 4) continue;
    const member = perLearner.find((m) => m.userId === row.userId);
    if (!member) continue;
    if (row.theta >= member.target - 1) continue; // only where they are actually behind
    const entry = microTotals.get(row.microSkill) ?? { learners: new Set<string>(), theta: 0, count: 0 };
    entry.learners.add(row.userId);
    entry.theta += row.theta;
    entry.count++;
    microTotals.set(row.microSkill, entry);
  }

  const shared = [...microTotals.entries()]
    .map(([microSkill, entry]) => ({
      microSkill,
      label: tryMicroSkill(microSkill)?.label ?? microSkill,
      learners: entry.learners.size,
      meanTheta: entry.theta / entry.count,
    }))
    .filter((row) => row.learners >= 2)
    .sort((a, b) => b.learners - a.learners || a.meanTheta - b.meanTheta)
    .slice(0, 8);

  const quiet = perLearner.filter((m) => m.daysQuiet !== null && m.daysQuiet >= 7);
  const unstarted = perLearner.filter((m) => m.daysQuiet === null);

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Cohort</p>
          <h1>What should this class spend an hour on?</h1>
          <p className="muted measure-wide">
            {members.length} member{members.length === 1 ? '' : 's'} in this organisation.
            {quiet.length ? ` ${quiet.length} have not worked in a week.` : ''}
            {unstarted.length ? ` ${unstarted.length} have not started.` : ''}
          </p>
        </div>
      </header>

      {/* --- The one thing worth teaching to the whole room --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Shared weaknesses
          </h2>
          <p className="tiny faint">Micro-skills more than one learner is behind on</p>
        </div>
        {shared.length ? (
          <div className="stack stack-3">
            {shared.map((row) => (
              <article key={row.microSkill} className="panel-quiet">
                <div className="row-between wrap" style={{ alignItems: 'flex-start' }}>
                  <div className="stack stack-1">
                    <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      {row.label}
                    </h3>
                    <p className="tiny faint">
                      {tryMicroSkill(row.microSkill)?.description ?? ''}
                    </p>
                  </div>
                  <p className="small numeric" style={{ whiteSpace: 'nowrap' }}>
                    <strong>{row.learners}</strong> learner{row.learners === 1 ? '' : 's'} · mean CLB{' '}
                    {row.meanTheta.toFixed(1)}
                  </p>
                </div>
              </article>
            ))}
            <p className="tiny faint">
              Ranked by how many people share the weakness, then by how far behind they are. The top row is the
              hour of class time that reaches the most learners.
            </p>
          </div>
        ) : (
          <div className="empty">
            <h3>Nothing shared yet</h3>
            <p className="small">
              A micro-skill appears here once at least two learners are more than a level below their target on
              it, with four or more items behind the estimate.
            </p>
          </div>
        )}
      </section>

      {/* --- The roster --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Learners, furthest from target first
          </h2>
        </div>
        {perLearner.length ? (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Role</th>
                  <th scope="col">Target</th>
                  <th scope="col">Estimate</th>
                  <th scope="col">Gap</th>
                  <th scope="col">Open errors</th>
                  <th scope="col">Last worked</th>
                </tr>
              </thead>
              <tbody>
                {perLearner.map((member) => (
                  <tr key={member.userId}>
                    <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>
                      {member.name}
                      <span className="tiny faint" style={{ display: 'block' }}>
                        {member.skillsMeasured} of 4 skills measured
                      </span>
                    </th>
                    <td className="small">{member.role}</td>
                    <td className="num numeric">CLB {member.target}</td>
                    <td className="num numeric">
                      {member.overall === null ? '—' : `CLB ${member.overall.toFixed(1)}`}
                    </td>
                    <td className="num numeric">
                      {member.gap === null ? '—' : member.gap <= 0 ? 'At target' : `−${member.gap.toFixed(1)}`}
                    </td>
                    <td className="num numeric">{member.openMistakes}</td>
                    <td className="num numeric">
                      {member.daysQuiet === null
                        ? 'Never'
                        : member.daysQuiet === 0
                          ? 'Today'
                          : `${member.daysQuiet}d ago`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <h3>Nobody here yet</h3>
            <p className="small">
              Everyone in this organisation appears here once they have an account. Invite people to your
              organisation to see them.
            </p>
          </div>
        )}
        <p className="tiny faint" style={{ marginTop: 'var(--s3)' }}>
          Estimates are the mean of a learner&rsquo;s measured skills. They are Meridian practice estimates from
          each learner&rsquo;s own history — not CELPIP scores, and with no official standing.
        </p>
      </section>

      <section className="panel-quiet stack stack-3">
        <p className="eyebrow">A note on what this does not show</p>
        <p className="small measure-wide">
          Individual answers, submissions and recordings are not surfaced here. A teacher can see where a
          learner stands and what to teach; reading someone&rsquo;s written responses is a separate permission
          and is not granted by the cohort view.
        </p>
        <p className="tiny faint">
          <Link href="/plans">About plans</Link>
        </p>
      </section>
    </div>
  );
}
