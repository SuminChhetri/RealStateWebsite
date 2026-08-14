import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { speakingSubmissions } from '@/lib/db/schema';
import { requireSessionApi } from '@/lib/auth/guard';
import { storage } from '@/lib/providers';

/**
 * Audio playback. The storage key is never exposed to the client and is looked
 * up from a row that must belong to the caller's own tenant — a learner cannot
 * fetch another learner's recording by guessing an id.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSessionApi();
  if (!session) return new Response('Not signed in.', { status: 401 });

  const { id } = await params;
  const submission = (await db
    .select()
    .from(speakingSubmissions)
    .where(
      and(
        eq(speakingSubmissions.id, id),
        eq(speakingSubmissions.userId, session.userId),
        eq(speakingSubmissions.orgId, session.orgId),
      ),
    )
    .limit(1))[0];

  if (!submission?.audioKey) return new Response('Not found.', { status: 404 });

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
