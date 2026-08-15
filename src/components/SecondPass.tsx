import type { SelfReview as SelfReviewData } from '@/lib/practice/self-review';
import { SelfReview } from '@/components/SelfReview';
import { ReviewRequest } from '@/components/ReviewRequest';

/**
 * What happens after the analysis — one component, because there is one policy.
 *
 * Writing and speaking ask the same question in the same order (is there a
 * person, is there a request, has it come back), and the answer has to be the
 * same in both places. Holding that logic twice is how the two drift: a fix
 * lands on the writing page, the speaking page keeps the old behaviour, and
 * nothing fails. The differences between the two are wording and a link, so
 * they are parameters here rather than a second copy of the reasoning.
 */

export interface SecondPassReview {
  status: 'requested' | 'claimed' | 'returned';
  feedback: string | null;
  reviewerLevel: number | null;
}

export function SecondPass({
  kind,
  /** Does the plan include human review? */
  entitled,
  /** Is there actually a person in this workspace who could do it? */
  reviewerAvailable,
  review,
  analyserLevel,
  selfReview,
  submissionId,
  retryHref,
  retryLabel,
  /** Speaking only: nothing to listen to means nothing to review. */
  reviewable = true,
}: {
  kind: 'writing' | 'speaking';
  entitled: boolean;
  reviewerAvailable: boolean;
  review: SecondPassReview | undefined;
  analyserLevel: number;
  selfReview: SelfReviewData;
  submissionId: string;
  retryHref: string;
  retryLabel: string;
  reviewable?: boolean;
}) {
  const speaking = kind === 'speaking';
  const protocol = <SelfReview review={selfReview} retryHref={retryHref} retryLabel={retryLabel} />;

  // A teacher is on the way, or has been. Everything in this branch depends on
  // a person existing; the branch below is what happens when none does.
  const withPerson = entitled && (reviewerAvailable || review);

  return (
    <section style={{ marginBottom: 'var(--s6)' }}>
      <div className="section-head">
        <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
          {withPerson && reviewerAvailable ? 'From a teacher' : 'The second pass'}
        </h2>
        <p className="tiny faint">
          {withPerson && reviewerAvailable
            ? speaking
              ? 'Someone who can hear it, not only measure it'
              : 'A judgement the analyser cannot make'
            : `What the analyser cannot ${speaking ? 'hear' : 'judge'}, and you can`}
        </p>
      </div>

      {!withPerson ? (
        protocol
      ) : review?.status === 'returned' ? (
        <article className="panel" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="stack stack-3">
            {review.reviewerLevel !== null ? (
              <p className="small">
                <strong>Their band: CLB {review.reviewerLevel.toFixed(1)}</strong>{' '}
                <span className="muted">
                  (the analyser above said {analyserLevel.toFixed(1)} — these are shown separately on
                  purpose; a human judgement and a rule-based estimate are different kinds of claim, and
                  averaging them would hide both)
                </span>
              </p>
            ) : null}
            <p className="prose" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>
              {review.feedback}
            </p>
          </div>
        </article>
      ) : review ? (
        <div className="stack stack-4">
          <p className="notice notice-caution">
            {review.status === 'claimed'
              ? `A teacher has picked this up and is ${speaking ? 'listening to' : 'reading'} it.`
              : reviewerAvailable
                ? 'Waiting for a teacher. The automated analysis above does not wait for it.'
                : `This was sent when someone was here to ${speaking ? 'hear' : 'read'} it, and nobody is now. Rather than leave you waiting on an answer that may not come, the self-review below is the same work you would be asked to do anyway.`}
          </p>
          {/* A request that can no longer be answered must not be the end of the
              page. The protocol is what the learner can act on today. */}
          {review.status === 'requested' && !reviewerAvailable ? protocol : null}
        </div>
      ) : reviewable ? (
        <ReviewRequest submissionType={kind} submissionId={submissionId} />
      ) : (
        <p className="notice notice-caution">
          No audio was stored for this response, so there is nothing for a teacher to listen to. Record it
          again to ask for a human review.
        </p>
      )}
    </section>
  );
}
