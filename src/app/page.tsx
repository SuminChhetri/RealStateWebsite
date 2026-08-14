import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { MICRO_SKILLS } from '@/lib/content/taxonomy';
import { readingStimuli } from '@/lib/content/seed/reading';
import { listeningStimuli } from '@/lib/content/seed/listening';
import { speakingTasks } from '@/lib/content/seed/speaking';
import { writingTasks } from '@/lib/content/seed/writing';
import './marketing.css';

export const dynamic = 'force-dynamic';

/**
 * The landing page comes after the product, not before it. Its job is to state
 * the claim precisely enough that a serious learner can tell whether it is
 * true, and to be honest about what the analysers can and cannot do — because
 * the alternative is a learner who feels misled the first time they read a
 * limitation inside the app.
 *
 * Every figure on this page is counted from the corpus at build time rather
 * than typed in. A marketing number that drifts from the product is a lie with
 * a delay on it.
 */
export default async function LandingPage() {
  if (await getSession()) redirect('/home');

  const microCount = MICRO_SKILLS.length;
  const itemCount = [...readingStimuli, ...listeningStimuli].reduce(
    (total, stimulus) => total + stimulus.questions.length,
    0,
  );
  const productionTasks = speakingTasks.length + writingTasks.length;

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
        {/* --- The claim, beside the thing the claim is about --- */}
        <section className="marketing-inner marketing-hero">
          <div className="marketing-hero-copy">
            <p className="eyebrow">CELPIP preparation · Canadian Language Benchmarks 5–12</p>
            <h1 className="marketing-headline">
              Most preparation tells you your score. This tells you what is holding it down.
            </h1>
            <p className="marketing-lede">
              Meridian tracks your performance across {microCount} micro-skills — not four. It knows the difference
              between a learner who misreads inference questions and one who reads them correctly but too slowly,
              and it prescribes different work for each.
            </p>
            <div className="row wrap" style={{ gap: 'var(--s3)' }}>
              <Link className="btn btn-primary btn-lg" href="/sign-up">
                Take the diagnostic
              </Link>
              <Link className="btn btn-lg" href="/sign-in">
                I have an account
              </Link>
            </div>
            <p className="tiny faint">
              Free and local-first. No payment details, no subscription, nothing to install.
            </p>
          </div>

          <SpecimenProfile />
        </section>

        {/* --- What there is to work with --- */}
        <section className="marketing-inner">
          <div className="marketing-figures">
            <div className="marketing-figure">
              <b className="serif">{microCount}</b>
              <span className="tiny faint">micro-skills diagnosed separately</span>
            </div>
            <div className="marketing-figure">
              <b className="serif">{itemCount}</b>
              <span className="tiny faint">authored reading and listening items</span>
            </div>
            <div className="marketing-figure">
              <b className="serif">{productionTasks}</b>
              <span className="tiny faint">speaking and writing tasks</span>
            </div>
            <div className="marketing-figure">
              <b className="serif">Unlimited</b>
              <span className="tiny faint">practice sets, generated before you run out</span>
            </div>
          </div>
        </section>

        {/* --- What it actually does --- */}
        <section className="marketing-inner marketing-section">
          <div className="section-head">
            <h2 className="serif" style={{ fontSize: '1.5rem' }}>
              The loop
            </h2>
            <p className="tiny faint">Every surface in the product is a view onto one of these</p>
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
          <div className="section-head">
            <h2 className="serif" style={{ fontSize: '1.5rem' }}>
              Where it differs
            </h2>
          </div>
          <div className="marketing-pillars">
            <article className="marketing-pillar">
              <h3 className="serif" style={{ fontSize: '1.1875rem' }}>
                Writing that is analysed, not rewritten
              </h3>
              <p className="small muted">
                Nine dimensions, each traced to something measurable in your text: coverage of the required content
                points, support density, cohesion between adjacent sentences, lexical range against frequency
                bands, and a curated set of usage patterns marked in place. You are told what to change and given
                the drill, not handed a corrected version to copy.
              </p>
            </article>
            <article className="marketing-pillar">
              <h3 className="serif" style={{ fontSize: '1.1875rem' }}>
                Speaking measured from the audio
              </h3>
              <p className="small muted">
                A loudness envelope sampled while you record yields real pause structure and articulation rate — how
                long your silences are and whether they fall between ideas or inside them. The transcript supplies
                structure, development and range. Pronunciation is declared out of scope rather than guessed at.
              </p>
            </article>
            <article className="marketing-pillar">
              <h3 className="serif" style={{ fontSize: '1.1875rem' }}>
                Practice that does not run out
              </h3>
              <p className="small muted">
                Authored passages carry the judgement calls — argument, tone, register. Alongside them, an item
                generator builds fresh timetable, vocabulary and usage questions from structured data, where the key
                is computed rather than written. It tops the bank up before you exhaust it. Generated items are
                marked as such everywhere they appear, and count for less when your estimate updates.
              </p>
            </article>
            <article className="marketing-pillar">
              <h3 className="serif" style={{ fontSize: '1.1875rem' }}>
                Scheduling built on forgetting
              </h3>
              <p className="small muted">
                Items return on the day your predicted recall drops to ninety per cent, tracked per item with its
                own difficulty and stability. Your own recorded mistakes go through the same queue, so the errors
                you actually make come back rather than sitting in a list you never open.
              </p>
            </article>
          </div>
        </section>

        {/* --- What it will not do --- */}
        <section className="marketing-inner marketing-section">
          <div className="panel-quiet stack stack-3" style={{ maxWidth: '46rem' }}>
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
              <li className="small muted">
                There is no language model in the product. The analysers and the item generator are rule-based
                systems, and both say so where they appear.
              </li>
            </ul>
          </div>
        </section>

        <section className="marketing-inner marketing-section marketing-cta">
          <div className="marketing-cta-panel">
            <h2 className="serif" style={{ fontSize: '1.65rem' }}>
              Start with the diagnostic
            </h2>
            <p className="muted measure">
              Twenty-five minutes across every task type, and everything after it — the plan, the practice
              difficulty, the order you work in — is built around what it finds.
            </p>
            <Link className="btn btn-primary btn-lg" href="/sign-up">
              Create an account
            </Link>
          </div>
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

/* ------------------------------------------------------------------ */

/**
 * A worked example of the profile the diagnostic produces.
 *
 * It is labelled as an example rather than dressed up as live data, because
 * the whole argument of this page is that the product does not overstate what
 * it knows — and a fake dashboard on the landing page would undercut that
 * before a learner reached it.
 *
 * The interval is the point. A reader who has only ever seen a single number
 * should be able to look at this and understand, without reading a caption,
 * that two of these skills are placed confidently and one is not.
 */
function SpecimenProfile() {
  const LOW = 5;
  const HIGH = 12;
  const target = 11;
  const scale = (value: number) => ((value - LOW) / (HIGH - LOW)) * 100;

  const rows = [
    { skill: 'reading', label: 'Reading', level: 7.6, low: 6.9, high: 8.3, note: 'Firming up' },
    { skill: 'listening', label: 'Listening', level: 6.0, low: 4.6, high: 7.4, note: 'Provisional' },
    { skill: 'writing', label: 'Writing', level: 8.4, low: 7.9, high: 8.9, note: 'Firming up' },
  ];

  return (
    <figure className="specimen" aria-label="Example of a learner profile with uncertainty bands">
      <div className="specimen-head">
        <span className="eyebrow">Example profile</span>
        <span className="tiny faint">Target CLB {target}</span>
      </div>

      {rows.map((row) => (
        <div key={row.skill} className="specimen-row" data-skill={row.skill}>
          <div className="specimen-row-head">
            <span className="specimen-name">
              <span className="skill-mark" aria-hidden />
              {row.label}
            </span>
            <span className="tiny faint numeric">
              CLB {row.level.toFixed(1)} · {row.low.toFixed(1)}–{row.high.toFixed(1)} · {row.note}
            </span>
          </div>
          <div className="specimen-track">
            <span
              className="specimen-band"
              style={{ left: `${scale(row.low)}%`, width: `${scale(row.high) - scale(row.low)}%` }}
            />
            <span className="specimen-point" style={{ left: `${scale(row.level)}%` }} />
            <span className="specimen-target" style={{ left: `${scale(target)}%` }} />
          </div>
        </div>
      ))}

      <div className="specimen-scale" aria-hidden>
        {[5, 6, 7, 8, 9, 10, 11, 12].map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>

      <figcaption className="specimen-note tiny faint">
        The shaded interval is how much is not yet known. Listening here is a wide band on few observations — the
        product says so rather than reporting 6.0 as though it were settled.
      </figcaption>
    </figure>
  );
}
