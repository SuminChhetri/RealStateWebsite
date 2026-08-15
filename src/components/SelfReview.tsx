import Link from 'next/link';
import type { SelfReview as SelfReviewData } from '@/lib/practice/self-review';

/**
 * The self-review protocol, rendered.
 *
 * Two things about this surface are deliberate and should stay that way.
 *
 * It says plainly what it is not, at the top, before anything else: not a
 * person, and not a model reading the work. A learner who believes something
 * has read their writing when nothing has is worse off than one who knows they
 * are marking their own — they will trust a judgement that was never made.
 *
 * And it ends in a button that goes back to the task. The passes are not the
 * point; the rewrite is. A checklist that closes with "well done" teaches
 * reading feedback, which is the habit that holds people at CLB 8.
 */
export function SelfReview({
  review,
  retryHref,
  retryLabel,
}: {
  review: SelfReviewData;
  retryHref: string;
  retryLabel: string;
}) {
  return (
    <div className="stack stack-4">
      <p className="notice">
        <strong>Nobody else is in this workspace</strong>, so there is no one to send this to. This is a
        structured self-review instead — not a person&rsquo;s judgement, and not a model reading your work.
        It is a set of questions built from the analysis above and this task&rsquo;s own requirements, and you
        are the one who answers them. No score comes out of it.
      </p>

      <ol className="stack stack-4" style={{ listStyle: 'none', padding: 0 }}>
        {review.passes.map((pass, index) => (
          <li key={pass.key} className="panel-quiet">
            <div className="stack stack-3">
              <div className="row-tight" style={{ alignItems: 'flex-start' }}>
                <span className="badge badge-accent numeric">{index + 1}</span>
                <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {pass.title}
                </h3>
              </div>
              <p className="small muted measure-wide">{pass.rationale}</p>
              <ul className="stack stack-2" style={{ paddingLeft: '1.1rem' }}>
                {pass.questions.map((question, i) => (
                  <li key={i} className="small">
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="inset stack stack-3">
        <p className="small measure-wide">{review.close}</p>
        <div>
          <Link className="btn btn-primary" href={retryHref}>
            {retryLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
