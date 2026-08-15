import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { speakingSubmissions } from '@/lib/db/schema';
import { requireSessionApi } from '@/lib/auth/guard';
import { holdsReviewOf } from '@/lib/practice/review-access';
import { storage } from '@/lib/providers';

/**
 * Audio playback. The storage key is never exposed to the client and is looked
 * up from a row that must belong to the caller's own tenant — a learner cannot
 * fetch another learner's recording by guessing an id.
 *
 * There is exactly one exception: the reviewer holding a claimed review of this
 * recording. Reviewing speech from a transcript alone would be a pretence of
 * review, so the person doing it has to be able to hear it. The exception is
 * scoped to that one submission and to the one person holding it — see
 * `holdsReviewOf`.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSessionApi();
  if (!session) return new Response('Not signed in.', { status: 401 });

  const { id } = await params;
  // Tenant first, owner second: the row is fetched within the caller's
  // organisation, and only then is it decided whether they may hear it.
  const submission = (await db
    .select()
    .from(speakingSubmissions)
    .where(and(eq(speakingSubmissions.id, id), eq(speakingSubmissions.orgId, session.orgId)))
    .limit(1))[0];

  if (!submission) return new Response('Not found.', { status: 404 });

  if (submission.userId !== session.userId && !(await holdsReviewOf(session, 'speaking', id))) {
    // Same response as a missing row, so the endpoint does not disclose that a
    // recording exists to someone not entitled to it.
    return new Response('Not found.', { status: 404 });
  }

  if (!submission.audioKey) return new Response('Not found.', { status: 404 });

  const file = await storage().get(submission.audioKey);
  if (!file) return new Response('Not found.', { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': submission.audioMimeType ?? file.contentType,
      'Content-Length': String(file.data.byteLength),
      'Cache-Control': 'private, max-age=3600',
      'Content-Disposition': 'inline',
    },
  });
}
