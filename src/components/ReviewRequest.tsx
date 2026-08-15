'use client';

import { useState, useTransition } from 'react';
import { requestReview } from '@/lib/practice/review-actions';

/**
 * Asking a person to look at this.
 *
 * The question box matters more than the button. "Have a look at this" gives a
 * teacher nothing to aim at; "is my second paragraph actually answering the
 * question" gives them a target and produces feedback worth the wait. So the
 * field is offered first and the prompt is specific about what to write in it.
 */
export function ReviewRequest({
  submissionType,
  submissionId,
}: {
  submissionType: 'writing' | 'speaking';
  submissionId: string;
}) {
  const [sent, setSent] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // The action revalidates this page, so in practice the server's rendering of
  // the request replaces this component before the branch below is reached.
  // It is kept as the fallback for the case where revalidation is slow, and it
  // is worded identically to the server's version — the learner should not read
  // two different sentences about the same fact depending on which one wins.
  if (sent) {
    return (
      <p className="notice notice-caution" role="status">
        Waiting for a teacher. The automated analysis above does not wait for it.
      </p>
    );
  }

  return (
    <div className="stack stack-3">
      <div className="field">
        <label htmlFor="review-question">What would you like them to look at?</label>
        <textarea
          className="input"
          id="review-question"
          rows={3}
          maxLength={600}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Optional, but a specific question gets a far more useful answer than “please check this”. For example: does my second paragraph actually answer the question, or am I restating the first?"
        />
      </div>
      <div>
        <button
          className="btn btn-primary"
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await requestReview({ submissionType, submissionId, question });
              if (result.ok) setSent(true);
              else setError(result.error ?? 'That could not be sent.');
            })
          }
        >
          {pending ? 'Sending…' : 'Ask a teacher to read this'}
        </button>
      </div>
      {error ? (
        <p className="notice notice-critical" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
