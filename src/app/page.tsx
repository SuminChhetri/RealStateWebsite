import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { MICRO_SKILLS } from '@/lib/content/taxonomy';
import './marketing.css';

export const dynamic = 'force-dynamic';

/**
 * The landing page comes after the product, not before it. Its job is to state
 * the claim precisely enough that a serious learner can tell whether it is
 * true, and to be honest about what the analysers can and cannot do — because
 * the alternative is a learner who feels misled the first time they read a
 * limitation inside the app.
 */
export default async function LandingPage() {
  if (await getSession()) redirect('/home');

  const microCount = MICRO_SKILLS.length;

  return (
    <div className="marketing">
      <header className="marketing-bar">
        <div className="marketing-inner row-between">
          <span className="row-tight">
            <span className="skill-mark" style={{ background: 'var(--accent)', height: '1em' }} aria-hidden />
            <span className="serif" style={{ fontSize: '1.0625rem' }}>
              Meridian
            </span>
          </span>
          <nav className="row-tight" aria-label="Account">
            <Link className="btn btn-ghost btn-sm" href="/sign-in">
              Sign in
            </Link>
            <Link className="btn btn-sm btn-primary" href="/sign-up">
              Start
            </Link>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* --- The claim --- */}
        <section className="marketing-inner marketing-hero">
          <p className="eyebrow">CELPIP preparation · Canadian Language Benchmarks 5–12</p>
          <h1 className="marketing-headline">
            Most preparation tells you your score. This tells you what is holding it down.
          </h1>
          <p className="marketing-lede">
            Meridian tracks your performance across {microCount} micro-skills — not four. It knows the difference
            between a learner who misreads inference questions and one who reads them correctly but too slowly, and
            it prescribes different work for each.
          </p>
          <div className="row wrap" style={{ gap: 'var(--s3)' }}>
            <Link className="btn btn-primary btn-lg" href="/sign-up">
              Take the diagnostic
            </Link>
            <Link className="btn btn-lg" href="/sign-in">
              I have an account
            </Link>
          </div>
          <p className="tiny faint" style={{ marginTop: 'var(--s4)' }}>
            Free and local-first. No payment details, no subscription, nothing to install.
          </p>
        </section>

        {/* --- What it actually does --- */}
        <section className="marketing-inner marketing-section">
          <div className="section-head">
            <h2 className="serif" style={{ fontSize: '1.5rem' }}>
              The loop
            </h2>
          </div>
          <ol className="marketing-loop">
            {[
              {
                step: 'Diagnose',
                text: 'Twenty-five minutes across every task type at a spread of difficulties. You get a profile with uncertainty bands, not a percentage.',
              },
              {
                step: 'Prescribe',
                text: 'Each action is scored as expected level gain per minute, and every recommendation shows the reasoning that produced it.',
              },
              {
                step: 'Practise',
                text: 'Sets are built at the difficulty where you get roughly two-thirds right — the range where the estimate moves fastest.',
              },
              {
                step: 'Explain',
                text: 'Every wrong answer comes with why the distractor attracted you, why the key is right, and the transferable move.',
              },
              {
                step: 'Retest',
                text: 'A mistake stays open until you have proved the fix three times on later items. One right answer is a coin flip.',
              },
              {
                step: 'Measure',
                text: 'Movement smaller than the uncertainty band is reported as noise, not progress.',
              },
            ].map((item) => (
              <li key={item.step}>
                <p className="eyebrow">{item.step}</p>
                <p className="small">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* --- The differentiators --- */}
        <section className="marketing-inner marketing-section">
          <div className="grid grid-2" style={{ gap: 'var(--s6)' }}>
            <article className="stack stack-3">
              <h3 className="serif" style={{ fontSize: '1.25rem' }}>
                Writing that is analysed, not rewritten
              </h3>
              <p className="small muted">
                Nine dimensions, each traced to something measurable in your text: coverage of the required content
                points, support density, cohesion between adjacent sentences, lexical range against frequency
                bands, and a curated set of usage patterns marked in place. You are told what to change and given
                the drill, not handed a corrected version to copy.
              </p>
            </article>
            <article className="stack stack-3">
              <h3 className="serif" style={{ fontSize: '1.25rem' }}>
                Speaking measured from the audio
              </h3>
              <p className="small muted">
                A loudness envelope sampled while you record yields real pause structure and articulation rate — how
                long your silences are and whether they fall between ideas or inside them. The transcript supplies
                structure, development and range. Pronunciation is declared out of scope rather than guessed at.
              </p>
            </article>
            <article className="stack stack-3">
              <h3 className="serif" style={{ fontSize: '1.25rem' }}>
                Scheduling built on forgetting
              </h3>
              <p className="small muted">
                Items return on the day your predicted recall drops to ninety per cent, tracked per item with its
                own difficulty and stability. Your own recorded mistakes go through the same queue, so the errors
                you actually make come back rather than sitting in a list you never open.
              </p>
            </article>
            <article className="stack stack-3">
              <h3 className="serif" style={{ fontSize: '1.25rem' }}>
                Honest about what it is
              </h3>
              <p className="small muted">
                The analysers here are transparent rule-based systems, and they say so on every page they appear on.
                Levels are Meridian practice estimates from your own history — not CELPIP scores, and with no
                official standing. Where an analysis cannot be performed honestly, the product says that instead of
                producing a number.
              </p>
            </article>
          </div>
        </section>

        {/* --- What it will not do --- */}
        <section className="marketing-inner marketing-section">
          <div className="panel-quiet stack stack-3" style={{ maxWidth: '44rem' }}>
            <p className="eyebrow">What Meridian does not claim</p>
            <ul className="stack stack-2" style={{ paddingLeft: '1.1rem' }}>
              <li className="small muted">
                It is not affiliated with, endorsed by, or connected to the organisations that produce or
                administer the CELPIP test.
              </li>
              <li className="small muted">
                Its estimates predict your own practice performance. They are not a score and cannot be submitted
                anywhere.
              </li>
              <li className="small muted">
                Its usage checking catches frequent errors precisely and will miss unusual ones. A clean report is
                not proof of a flawless response.
              </li>
              <li className="small muted">
                It cannot judge whether an argument is persuasive or original. That limitation is printed next to
                every evaluation.
              </li>
            </ul>
          </div>
        </section>

        <section className="marketing-inner marketing-section marketing-cta">
          <h2 className="serif" style={{ fontSize: '1.65rem' }}>
            Start with the diagnostic
          </h2>
          <p className="muted measure">
            Twenty-five minutes, and everything after it is built around what it finds.
          </p>
          <Link className="btn btn-primary btn-lg" href="/sign-up">
            Create an account
          </Link>
        </section>
      </main>

      <footer className="marketing-inner marketing-foot">
        <p className="tiny faint">
          Meridian is an independent preparation platform. CELPIP and the Canadian Language Benchmarks are
          referenced descriptively; no affiliation is claimed or implied.
        </p>
      </footer>
    </div>
  );
}
