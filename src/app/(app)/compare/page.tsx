import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, sql } from 'drizzle-orm';
import { checkFeature, requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import { attemptItems, attempts, questions } from '@/lib/db/schema';
import { compareEstimates, type MovementKind } from '@/lib/engines/sitting-report';
import { LockedFeature } from '@/components/LockedFeature';
import { SKILL_LABELS, tryMicroSkill, type Domain } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Compare sittings' };
export const dynamic = 'force-dynamic';

/**
 * Two sittings, side by side.
 *
 * This is the question every repeat candidate asks — "am I actually better than
 * last time?" — and almost nothing answers it honestly, because answering it
 * honestly often means saying "that is noise" about a number someone was
 * pleased with.
 *
 * The rule is applied without exception: a difference counts only when it
 * exceeds the combined standard error of the two estimates. A learner who is
 * told a two-point jump is noise, and who then sees a smaller jump reported as
 * real once the evidence is thicker, has been given something they can trust.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireSession();
  const gate = await checkFeature(session, 'sitting_comparison');
  const query = await searchParams;

  if (!gate.allowed) {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Compare sittings</p>
            <h1>Am I actually better than last time?</h1>
            <p className="muted measure-wide">
              Two sittings side by side, with every difference classified as real movement or as noise against
              the uncertainty of the two measurements.
            </p>
          </div>
        </header>
        <LockedFeature
          feature="sitting_comparison"
          currentPlan={gate.plan}
          requiredPlan={gate.required}
          what="side-by-side sitting comparison"
        />
      </div>
    );
  }

  const completed = await db
    .select({
      id: attempts.id,
      skill: attempts.skill,
      mode: attempts.mode,
      startedAt: attempts.startedAt,
      rawScore: attempts.rawScore,
      maxScore: attempts.maxScore,
      estimatedLevel: attempts.estimatedLevel,
      se: attempts.levelSe,
    })
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, session.userId),
        eq(attempts.orgId, session.orgId),
        sql`${attempts.completedAt} is not null`,
        sql`${attempts.estimatedLevel} is not null`,
      ),
    )
    .orderBy(desc(attempts.startedAt))
    .limit(30);

  if (completed.length < 2) {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Compare sittings</p>
            <h1>Am I actually better than last time?</h1>
          </div>
        </header>
        <div className="empty">
          <h3>Two sittings are needed</h3>
          <p className="small">
            You have completed {completed.length}. Comparison starts at two, and is most useful when both are
            the same kind of set.
          </p>
        </div>
      </div>
    );
  }

  const laterId = query.later ?? completed[0].id;
  const earlierId = query.earlier ?? completed.find((a) => a.id !== laterId)?.id ?? completed[1].id;
  const later = completed.find((a) => a.id === laterId) ?? completed[0];
  const earlier = completed.find((a) => a.id === earlierId) ?? completed[1];

  const itemsFor = async (attemptId: string) =>
    db
      .select({
        correct: attemptItems.correct,
        elapsedMs: attemptItems.elapsedMs,
        targetSeconds: questions.targetSeconds,
        microSkill: questions.microSkill,
      })
      .from(attemptItems)
      .innerJoin(questions, eq(questions.id, attemptItems.questionId))
      .where(eq(attemptItems.attemptId, attemptId));

  const [earlierItems, laterItems] = await Promise.all([itemsFor(earlier.id), itemsFor(later.id)]);

  const overall = compareEstimates({
    label: 'Estimate',
    before: { level: earlier.estimatedLevel ?? 0, se: earlier.se ?? 1 },
    after: { level: later.estimatedLevel ?? 0, se: later.se ?? 1 },
  });

  const paceOf = (rows: typeof earlierItems) => {
    const timed = rows.filter((r) => r.elapsedMs && r.targetSeconds > 0);
    if (!timed.length) return 0;
    return timed.reduce((sum, r) => sum + r.elapsedMs! / 1000 / r.targetSeconds, 0) / timed.length;
  };
  const accuracyOf = (rows: typeof earlierItems) =>
    rows.length ? rows.filter((r) => r.correct === true).length / rows.length : 0;

  // Micro-skills present in both, so the comparison is like for like.
  const microOf = (rows: typeof earlierItems) => {
    const map = new Map<string, { attempted: number; correct: number }>();
    for (const row of rows) {
      const current = map.get(row.microSkill) ?? { attempted: 0, correct: 0 };
      current.attempted++;
      if (row.correct === true) current.correct++;
      map.set(row.microSkill, current);
    }
    return map;
  };
  const earlierMicro = microOf(earlierItems);
  const laterMicro = microOf(laterItems);

  const shared = [...laterMicro.entries()]
    .filter(([key, value]) => {
      const before = earlierMicro.get(key);
      // Three items each side is the floor at which a percentage means anything
      // at all; below that the arithmetic is theatre.
      return before && before.attempted >= 3 && value.attempted >= 3;
    })
    .map(([key, after]) => {
      const before = earlierMicro.get(key)!;
      const beforeRate = before.correct / before.attempted;
      const afterRate = after.correct / after.attempted;
      return {
        microSkill: key,
        label: tryMicroSkill(key)?.label ?? key,
        before: beforeRate,
        after: afterRate,
        delta: afterRate - beforeRate,
        counts: `${before.correct}/${before.attempted} → ${after.correct}/${after.attempted}`,
      };
    })
    .sort((a, b) => b.delta - a.delta);

  const date = (seconds: number) =>
    new Date(seconds * 1000).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });

  const tone: Record<MovementKind, string> = {
    improved: 'positive',
    declined: 'critical',
    noise: 'rule-strong',
  };

  return (
    <div className="page-narrow">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Compare sittings</p>
          <h1>Am I actually better than last time?</h1>
          <p className="muted measure-wide">
            {SKILL_LABELS[earlier.skill as Domain] ?? earlier.skill} · {date(earlier.startedAt)} compared with{' '}
            {SKILL_LABELS[later.skill as Domain] ?? later.skill} · {date(later.startedAt)}
          </p>
        </div>
      </header>

      {earlier.skill !== later.skill ? (
        <p className="notice notice-caution">
          These are different skills, so the comparison below is between two different things. Pick two sittings
          of the same skill for a like-for-like reading.
        </p>
      ) : null}

      {/* --- The honest answer --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <article className="panel" style={{ borderLeft: `3px solid var(--${tone[overall.kind]})` }}>
          <div className="stack stack-3">
            <p className="eyebrow">
              {overall.kind === 'noise'
                ? 'No measurable change'
                : overall.kind === 'improved'
                  ? 'Real improvement'
                  : 'Real decline'}
            </p>
            <p className="serif" style={{ fontSize: '1.35rem' }}>
              CLB {overall.before.toFixed(1)} → {overall.after.toFixed(1)}{' '}
              <span className="numeric muted" style={{ fontSize: '1rem' }}>
                ({overall.delta >= 0 ? '+' : ''}
                {overall.delta.toFixed(1)})
              </span>
            </p>
            <p className="small measure-wide">{overall.explanation}</p>
          </div>
        </article>
      </section>

      {/* --- The raw comparison --- */}
      <section style={{ marginBottom: 'var(--s7)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Side by side</h2>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th scope="col">{date(earlier.startedAt)}</th>
                <th scope="col">{date(later.startedAt)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>Score</th>
                <td className="num numeric">{earlier.rawScore}/{earlier.maxScore}</td>
                <td className="num numeric">{later.rawScore}/{later.maxScore}</td>
              </tr>
              <tr>
                <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>Accuracy</th>
                <td className="num numeric">{Math.round(accuracyOf(earlierItems) * 100)}%</td>
                <td className="num numeric">{Math.round(accuracyOf(laterItems) * 100)}%</td>
              </tr>
              <tr>
                <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>Pace</th>
                <td className="num numeric">{paceOf(earlierItems).toFixed(2)}×</td>
                <td className="num numeric">{paceOf(laterItems).toFixed(2)}×</td>
              </tr>
              <tr>
                <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>Estimate</th>
                <td className="num numeric">CLB {earlier.estimatedLevel?.toFixed(1)}</td>
                <td className="num numeric">CLB {later.estimatedLevel?.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="tiny faint" style={{ marginTop: 'var(--s3)' }}>
          Score and accuracy are raw counts and carry no uncertainty statement. Only the estimate is
          classified as movement or noise, because only it has a standard error attached.
        </p>
      </section>

      {/* --- Micro-skills present in both --- */}
      {shared.length ? (
        <section style={{ marginBottom: 'var(--s7)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Micro-skills in both sittings
            </h2>
            <p className="tiny faint">Three or more items each side</p>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Micro-skill</th>
                  <th scope="col">Then → now</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                {shared.map((row) => (
                  <tr key={row.microSkill}>
                    <th scope="row" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontSize: '0.875rem' }}>
                      {row.label}
                    </th>
                    <td className="num numeric">{row.counts}</td>
                    <td className="num numeric">
                      {row.delta >= 0 ? '+' : ''}
                      {Math.round(row.delta * 100)} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tiny faint" style={{ marginTop: 'var(--s3)' }}>
            These are raw rates on small samples. A swing of one item on a set of four is twenty-five points, so
            treat the direction as a hint and the estimate above as the answer.
          </p>
        </section>
      ) : null}

      {/* --- Pick different sittings --- */}
      <section>
        <div className="section-head">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Compare two others
          </h2>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Skill</th>
                <th scope="col">Score</th>
                <th scope="col"><span className="visually-hidden">Choose</span></th>
              </tr>
            </thead>
            <tbody>
              {completed.slice(0, 12).map((row) => (
                <tr key={row.id}>
                  <td className="num numeric">{date(row.startedAt)}</td>
                  <td>{SKILL_LABELS[row.skill as Domain] ?? row.skill}</td>
                  <td className="num numeric">{row.rawScore}/{row.maxScore}</td>
                  <td className="row-tight">
                    <Link className="tiny" href={`/compare?earlier=${row.id}&later=${laterId}`}>
                      as earlier
                    </Link>
                    <Link className="tiny" href={`/compare?earlier=${earlierId}&later=${row.id}`}>
                      as later
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
