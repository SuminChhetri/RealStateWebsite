import type { Metadata } from 'next';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/guard';
import { getProfile } from '@/lib/learner/profile';
import { startDiagnostic } from '@/lib/practice/actions';
import { MICRO_SKILLS } from '@/lib/content/taxonomy';

export const metadata: Metadata = { title: 'Diagnostic' };
export const dynamic = 'force-dynamic';

export default async function DiagnosticPage() {
  const session = await requireSession();
  const profile = await getProfile(session.userId, session.orgId);
  const sampled = MICRO_SKILLS.filter((m) => m.skill === 'reading' || m.skill === 'listening');

  return (
    <main id="main" className="page-narrow">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">{profile.hasDiagnostic ? 'Retake the diagnostic' : 'Step 2 of 2'}</p>
          <h1>Twenty-five minutes that decide everything after them</h1>
          <p className="muted measure-wide">
            This is not a practice test and it will not give you a score out of a hundred. It samples the
            micro-skills that separate the bands, at a spread of difficulties, and returns a profile: which parts
            of reading and listening are carrying you, and which are holding you back.
          </p>
        </div>
      </header>

      <section className="stack stack-5">
        <div className="panel stack stack-4">
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            What happens
          </h2>
          <ol className="stack stack-3" style={{ paddingLeft: '1.1rem' }}>
            <li className="small">
              <strong>24 items, timed.</strong> Reading and listening, drawn from every task type. The clock is on
              because performance under time pressure is a different measurement from performance without it — and
              Meridian tracks both separately from here on.
            </li>
            <li className="small">
              <strong>Difficulty adapts to the evidence.</strong> Items are selected around where you are likely to
              get roughly two-thirds right, which is the range that says most about your level.
            </li>
            <li className="small">
              <strong>You get a profile, not a percentage.</strong> Each micro-skill gets an estimate and an
              uncertainty band. Where there is not enough evidence yet, Meridian says so rather than guessing.
            </li>
            <li className="small">
              <strong>Everything after this is built from it.</strong> Today’s recommendation, your study plan, the
              difficulty of every future set.
            </li>
          </ol>
        </div>

        <div className="panel-quiet stack stack-3">
          <p className="eyebrow">Micro-skills sampled</p>
          <p className="small muted">
            {sampled.length} in the taxonomy; the diagnostic covers the highest-weight ones first and fills in the
            rest as you practise.
          </p>
          <ul className="row wrap" style={{ listStyle: 'none', padding: 0, gap: 'var(--s2)' }}>
            {sampled
              .filter((m) => m.diagnosticWeight >= 1)
              .map((m) => (
                <li key={m.slug}>
                  <span className="badge">{m.label}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="panel-quiet stack stack-3">
          <p className="eyebrow">Writing and speaking</p>
          <p className="small muted measure-wide">
            Productive skills are not measured by multiple choice, so they are not in this diagnostic. They are
            placed the first time you submit a written response or a recording — Meridian will ask you for one as
            soon as this is done.
          </p>
        </div>

        <form action={startDiagnostic} className="row wrap">
          <button className="btn btn-primary btn-lg" type="submit">
            Start the diagnostic
          </button>
          {profile.hasDiagnostic ? (
            <Link className="btn" href="/home">
              Not now
            </Link>
          ) : null}
        </form>
      </section>
    </main>
  );
}
