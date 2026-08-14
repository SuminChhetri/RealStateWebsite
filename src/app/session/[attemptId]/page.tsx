import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth/guard';
import { hydrateAttempt } from '@/lib/practice/delivery';
import { submitPractice } from '@/lib/practice/actions';
import { db } from '@/lib/db/client';
import { attempts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { Runner } from '@/components/session/Runner';
import '../runner.css';

export const metadata: Metadata = { title: 'Practice', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SessionPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await requireSession();

  const attempt = (await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.id, attemptId), eq(attempts.userId, session.userId), eq(attempts.orgId, session.orgId)))
    .limit(1))[0];
  if (!attempt) notFound();
  if (attempt.completedAt) redirect(`/session/${attemptId}/results`);

  const set = await hydrateAttempt(attemptId, session.userId, session.orgId);
  if (!set) notFound();

  return (
    <main id="main">
      <Runner
        attemptId={set.attemptId}
        mode={set.mode}
        skill={set.skill}
        timed={set.timed}
        timeLimitSeconds={set.timeLimitSeconds}
        questions={set.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          format: q.format,
          options: q.options,
          microSkill: q.microSkill,
          targetSeconds: q.targetSeconds,
          stimulusId: q.stimulusId,
        }))}
        stimuli={set.stimuli.map((s) => ({
          id: s.id,
          title: s.title,
          partType: s.partType,
          skill: s.skill,
          body: s.body,
          script: s.script as { speaker: string; voice: string; text: string }[] | null,
          figure: s.figure,
        }))}
        submitAction={submitPractice}
      />
    </main>
  );
}
