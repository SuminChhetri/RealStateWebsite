import type { Metadata } from 'next';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { checkFeature, requireSession } from '@/lib/auth/guard';
import { db } from '@/lib/db/client';
import {
  reviewRequests,
  speakingSubmissions,
  speakingTasks,
  users,
  writingSubmissions,
  writingTasks,
} from '@/lib/db/schema';
import { LockedFeature } from '@/components/LockedFeature';
import { claimReview, releaseReview, returnReview } from '@/lib/practice/review-actions';
import { isReviewerRole } from '@/lib/practice/review-access';

export const metadata: Metadata = { title: 'Review queue' };
export const dynamic = 'force-dynamic';

/**
 * The teacher's queue.
 *
 * Ordered oldest first, without exception. A queue sorted by anything else —
 * shortest, easiest, most recent — quietly starves whoever is least able to
 * chase it, and the person waiting longest is the person the queue exists for.
 *
 * A claim is what stops two teachers writing over one another. It is
 * conditional on the request still being unclaimed, so whoever gets there first
 * wins and the other is told rather than silently discarded.
 */
export default async function ReviewQueuePage() {
  const session = await requireSession();
  const gate = await checkFeature(session, 'teacher_review');

  if (!gate.allowed) {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Review queue</p>
            <h1>Work waiting for a person to read it</h1>
            <p className="muted measure-wide">
              The analysers here cannot judge whether an argument persuades or whether an example is apt. A
              teacher can. This is where learners ask for that, and where teachers answer.
            </p>
          </div>
        </header>
        <LockedFeature
          feature="teacher_review"
          currentPlan={gate.plan}
          requiredPlan={gate.required}
          what="the teacher review queue"
        />
      </div>
    );
  }

  const canReview = isReviewerRole(session.role);
  if (!canReview) {
    return (
      <div className="page-narrow">
        <header className="page-header">
          <div className="stack stack-3">
            <p className="eyebrow">Review queue</p>
            <h1>Not available to your account</h1>
          </div>
        </header>
        <p className="notice notice-caution">
          Your organisation includes human review, but your role is <strong>{session.role}</strong>. Reviewing
          other learners&rsquo; work requires a teacher or reviewer role.
        </p>
      </div>
    );
  }

  const queue = await db
    .select({
      id: reviewRequests.id,
      submissionType: reviewRequests.submissionType,
      submissionId: reviewRequests.submissionId,
      question: reviewRequests.question,
      status: reviewRequests.status,
      reviewerId: reviewRequests.reviewerId,
      createdAt: reviewRequests.createdAt,
      learner: users.name,
    })
    .from(reviewRequests)
    .innerJoin(users, eq(users.id, reviewRequests.userId))
    .where(and(eq(reviewRequests.orgId, session.orgId), inArray(reviewRequests.status, ['requested', 'claimed'])))
    // Oldest first. See the note above.
    .orderBy(asc(reviewRequests.createdAt));

  const writingIds = queue.filter((r) => r.submissionType === 'writing').map((r) => r.submissionId);
  const speakingIds = queue.filter((r) => r.submissionType === 'speaking').map((r) => r.submissionId);

  const [writingRows, speakingRows] = await Promise.all([
    writingIds.length
      ? db
          .select({
            id: writingSubmissions.id,
            text: writingSubmissions.text,
            wordCount: writingSubmissions.wordCount,
            title: writingTasks.title,
            requirements: writingTasks.requirements,
          })
          .from(writingSubmissions)
          .innerJoin(writingTasks, eq(writingTasks.id, writingSubmissions.taskId))
          .where(and(eq(writingSubmissions.orgId, session.orgId), inArray(writingSubmissions.id, writingIds)))
      : Promise.resolve([]),
    speakingIds.length
      ? db
          .select({
            id: speakingSubmissions.id,
            transcript: speakingSubmissions.transcript,
            durationMs: speakingSubmissions.durationMs,
            title: speakingTasks.title,
            audioKey: speakingSubmissions.audioKey,
          })
          .from(speakingSubmissions)
          .innerJoin(speakingTasks, eq(speakingTasks.id, speakingSubmissions.taskId))
          .where(and(eq(speakingSubmissions.orgId, session.orgId), inArray(speakingSubmissions.id, speakingIds)))
      : Promise.resolve([]),
  ]);

  const writingById = new Map(writingRows.map((r) => [r.id, r]));
  const speakingById = new Map(speakingRows.map((r) => [r.id, r]));

  const waited = (seconds: number) => {
    const hours = Math.floor((Date.now() / 1000 - seconds) / 3600);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack stack-3">
          <p className="eyebrow">Review queue</p>
          <h1>{queue.length} waiting</h1>
          <p className="muted measure-wide">
            Oldest first. Claim a piece before writing on it — a claim is what stops two people answering the
            same learner twice.
          </p>
        </div>
      </header>

      {queue.length === 0 ? (
        <div className="empty">
          <h3>Nothing waiting</h3>
          <p className="small">Requests from learners in your organisation appear here, oldest first.</p>
        </div>
      ) : (
        <div className="stack stack-5">
          {queue.map((request) => {
            const writing = writingById.get(request.submissionId);
            const speaking = speakingById.get(request.submissionId);
            const mine = request.reviewerId === session.userId;
            const claimedByOther = request.status === 'claimed' && !mine;
            const requirements = writing ? (JSON.parse(writing.requirements) as string[]) : [];

            return (
              <article key={request.id} className="panel stack stack-4">
                <div className="row-between wrap" style={{ alignItems: 'flex-start' }}>
                  <div className="stack stack-1">
                    <div className="row-tight wrap">
                      <span className="badge">{request.submissionType}</span>
                      <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                        {writing?.title ?? speaking?.title ?? 'Submission'}
                      </h2>
                      {claimedByOther ? <span className="badge badge-caution">Claimed by someone else</span> : null}
                      {mine ? <span className="badge badge-accent">Yours</span> : null}
                    </div>
                    <p className="tiny faint">
                      {request.learner} · asked {waited(request.createdAt)}
                      {writing ? ` · ${writing.wordCount} words` : ''}
                      {speaking ? ` · ${Math.round(speaking.durationMs / 1000)}s` : ''}
                    </p>
                  </div>

                  {request.status === 'requested' ? (
                    <form action={claimReview}>
                      <input type="hidden" name="id" value={request.id} />
                      <button className="btn btn-primary btn-sm" type="submit">
                        Claim
                      </button>
                    </form>
                  ) : mine ? (
                    <form action={releaseReview}>
                      <input type="hidden" name="id" value={request.id} />
                      <button className="btn btn-sm" type="submit">
                        Release
                      </button>
                    </form>
                  ) : null}
                </div>

                {request.question ? (
                  <div className="inset stack stack-1">
                    <p className="eyebrow">What they asked</p>
                    <p className="small">{request.question}</p>
                  </div>
                ) : null}

                {requirements.length ? (
                  <div className="stack stack-1">
                    <p className="eyebrow">The task required</p>
                    <ul className="stack stack-1" style={{ paddingLeft: '1.1rem' }}>
                      {requirements.map((requirement) => (
                        <li key={requirement} className="tiny">
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Speech is judged by ear. The transcript is the aid, not the
                    evidence — so the recording is offered first, and only to the
                    reviewer holding this piece. */}
                {speaking && mine && speaking.audioKey ? (
                  <div className="stack stack-2">
                    <p className="eyebrow">The recording</p>
                    <audio controls src={`/api/speaking/audio/${speaking.id}`} style={{ width: '100%' }}>
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : null}

                <div className="stack stack-2">
                  <p className="eyebrow">{writing ? 'What they wrote' : 'Transcript'}</p>
                  <div className="inset">
                    <p className="prose" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>
                      {writing?.text ?? speaking?.transcript ?? 'No text available.'}
                    </p>
                  </div>
                  {speaking ? (
                    <p className="tiny faint">
                      {speaking.audioKey
                        ? mine
                          ? 'Judge it from the recording. A transcript loses stress, intonation and hesitation, which is most of what separates the top two bands.'
                          : 'Claim this to hear the recording.'
                        : 'No audio was stored for this response, so only the transcript is available. Say so in your feedback if it limits what you can judge.'}
                    </p>
                  ) : null}
                </div>

                {mine ? (
                  <form action={returnReview} className="stack stack-3">
                    <input type="hidden" name="id" value={request.id} />
                    <div className="field">
                      <label htmlFor={`feedback-${request.id}`}>Your feedback</label>
                      <textarea
                        className="input"
                        id={`feedback-${request.id}`}
                        name="feedback"
                        rows={6}
                        minLength={20}
                        maxLength={4000}
                        required
                        placeholder="What would move this response up a band? Name the move, not just the fault."
                      />
                    </div>
                    <div className="field" style={{ maxWidth: '14rem' }}>
                      <label htmlFor={`level-${request.id}`}>Your band (optional)</label>
                      <input
                        className="input"
                        id={`level-${request.id}`}
                        name="reviewerLevel"
                        type="number"
                        min={4}
                        max={12}
                        step={0.5}
                        placeholder="e.g. 9"
                      />
                      <p className="tiny faint">
                        Shown beside the analyser&rsquo;s estimate, never merged into it. A human judgement and
                        a rule-based estimate are different kinds of claim.
                      </p>
                    </div>
                    <div>
                      <button className="btn btn-primary" type="submit">
                        Return to learner
                      </button>
                    </div>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
