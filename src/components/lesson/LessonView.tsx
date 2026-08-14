'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { LessonBlock } from '@/lib/content/seed/types';
import { completeLesson, type LessonOutcome } from '@/lib/practice/lesson-actions';

/**
 * Lesson rendering.
 *
 * The interactive blocks are the reason lessons exist in this product rather
 * than as documents: a checkpoint forces retrieval before the next idea
 * arrives, and a drill hides the answer until the learner has committed to
 * one. Reading prose about a technique produces recognition; being asked to
 * produce it produces recall.
 *
 * Checkpoint answers are collected here and submitted when the last one is
 * answered. Until that existed, a lesson gave feedback on the page and then
 * ended — nothing was recorded, so nothing could come back, and the study plan
 * could not tell a lesson that had been worked through from one that had never
 * been opened.
 */
export function LessonView({ blocks, lessonSlug }: { blocks: LessonBlock[]; lessonSlug: string }) {
  const checkpointIndices = blocks
    .map((block, i) => (block.type === 'checkpoint' ? i : -1))
    .filter((i) => i >= 0);

  const [answers, setAnswers] = useState<Record<number, { correct: boolean; prompt: string }>>({});
  const [outcome, setOutcome] = useState<LessonOutcome | null>(null);
  const [pending, startTransition] = useTransition();

  const answered = Object.keys(answers).length;
  const allAnswered = checkpointIndices.length > 0 && answered === checkpointIndices.length;

  function record(index: number, correct: boolean, prompt: string) {
    // First answer only. Changing it afterwards would let a learner convert a
    // miss into a hit by clicking again, which would make the record useless.
    setAnswers((current) => (index in current ? current : { ...current, [index]: { correct, prompt } }));
  }

  function submit() {
    if (!allAnswered || outcome || pending) return;
    startTransition(async () => {
      const result = await completeLesson({
        lessonSlug,
        responses: checkpointIndices.map((index) => ({
          index,
          prompt: answers[index]?.prompt ?? '',
          correct: answers[index]?.correct ?? false,
        })),
      });
      setOutcome(result);
    });
  }

  return (
    <div className="stack stack-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} index={i} onAnswer={record} />
      ))}

      {checkpointIndices.length > 0 ? (
        <LessonClose
          total={checkpointIndices.length}
          answered={answered}
          allAnswered={allAnswered}
          outcome={outcome}
          pending={pending}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

/**
 * The end of the lesson.
 *
 * Before the last checkpoint is answered this is a progress line, because
 * telling someone what they scored while they are still working is noise. After
 * submission it is the only part of the lesson that says what happens next.
 */
function LessonClose({
  total,
  answered,
  allAnswered,
  outcome,
  pending,
  onSubmit,
}: {
  total: number;
  answered: number;
  allAnswered: boolean;
  outcome: LessonOutcome | null;
  pending: boolean;
  onSubmit: () => void;
}) {
  if (outcome?.ok) {
    const perfect = outcome.correct === outcome.total;
    return (
      <section
        className="panel stack stack-4"
        style={{ borderLeft: `3px solid var(--${perfect ? 'positive' : 'caution'})` }}
        aria-live="polite"
      >
        <div className="stack stack-2">
          <p className="eyebrow">Lesson complete</p>
          <h2 style={{ fontSize: '1.15rem' }}>
            {outcome.correct} of {outcome.total} checkpoints right
          </h2>
        </div>

        {perfect ? (
          <p className="small measure-wide">
            Every checkpoint landed. That is recognition confirmed, not skill confirmed — the technique is only
            proved when it survives a timed set, so the useful next step is practice rather than another lesson.
          </p>
        ) : (
          <div className="stack stack-3">
            <p className="small measure-wide">
              {outcome.total - outcome.correct} checkpoint
              {outcome.total - outcome.correct === 1 ? '' : 's'} did not land. Each one is now in your review
              queue — {outcome.scheduled} card{outcome.scheduled === 1 ? '' : 's'} added, due straight away, and
              the interval grows each time you get it right. Re-reading the lesson now would produce
              recognition; being asked again cold is what produces recall.
            </p>
            {outcome.missed.length ? (
              <p className="small muted">
                This lesson teaches{' '}
                {outcome.missed.map((m) => m.label.toLowerCase()).join(', ')}. Those micro-skills are what to
                watch in your next set.
              </p>
            ) : null}
          </div>
        )}

        <div className="row wrap" style={{ gap: 'var(--s3)' }}>
          <Link className="btn btn-primary" href="/review">
            Go to review
          </Link>
          <Link className="btn" href="/home">
            Back to today
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-quiet stack stack-3">
      <p className="eyebrow">Checkpoints</p>
      <p className="small">
        {answered} of {total} answered.
        {allAnswered ? ' Record the result so the ones you missed come back.' : ' Answer each one as you reach it.'}
      </p>
      <div>
        <button className="btn btn-primary" type="button" onClick={onSubmit} disabled={!allAnswered || pending}>
          {pending ? 'Saving…' : 'Finish lesson'}
        </button>
      </div>
      {outcome && !outcome.ok && outcome.error ? (
        <p className="small" style={{ color: 'var(--critical)' }} role="alert">
          {outcome.error}
        </p>
      ) : null}
    </section>
  );
}

function Block({
  block,
  index,
  onAnswer,
}: {
  block: LessonBlock;
  index: number;
  onAnswer: (index: number, correct: boolean, prompt: string) => void;
}) {
  switch (block.type) {
    case 'prose':
      return (
        <section className="stack stack-3">
          {block.heading ? (
            <h2 style={{ fontSize: '1.15rem' }}>{block.heading}</h2>
          ) : null}
          <p className="prose">{block.text}</p>
        </section>
      );

    case 'principle':
      return (
        <aside
          className="panel"
          style={{ borderLeft: '3px solid var(--accent)', background: 'var(--accent-soft)' }}
        >
          <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
            The principle
          </p>
          <p className="serif" style={{ fontSize: '1.15rem', lineHeight: 1.45 }}>
            {block.text}
          </p>
        </aside>
      );

    case 'callout':
      return (
        <aside
          className="panel-quiet"
          style={{
            borderLeft: `3px solid ${block.tone === 'warning' ? 'var(--caution)' : 'var(--accent)'}`,
          }}
        >
          <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
            {block.tone === 'warning' ? 'Watch out' : 'Worth knowing'}
          </p>
          <p className="small">{block.text}</p>
        </aside>
      );

    case 'example':
      return (
        <section className="panel stack stack-4">
          <p className="eyebrow">{block.label}</p>
          <div className="grid grid-2">
            <div className="stack stack-2">
              <p className="tiny" style={{ color: 'var(--critical)', fontWeight: 600 }}>
                Weaker
              </p>
              <p className="small" style={{ fontFamily: 'var(--font-reading)', lineHeight: 1.65 }}>
                {block.weak}
              </p>
            </div>
            <div className="stack stack-2">
              <p className="tiny" style={{ color: 'var(--positive)', fontWeight: 600 }}>
                Stronger
              </p>
              <p className="small" style={{ fontFamily: 'var(--font-reading)', lineHeight: 1.65 }}>
                {block.strong}
              </p>
            </div>
          </div>
          <p className="small muted inset">{block.why}</p>
        </section>
      );

    case 'compare':
      return (
        <section className="stack stack-3">
          <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{block.heading}</h3>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">{block.leftLabel}</th>
                  <th scope="col">{block.rightLabel}</th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.left}</td>
                    <td>{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );

    case 'checkpoint':
      return <Checkpoint block={block} index={index} onAnswer={onAnswer} />;

    case 'drill':
      return <Drill block={block} />;

    default:
      return null;
  }
}

function Checkpoint({
  block,
  index,
  onAnswer,
}: {
  block: Extract<LessonBlock, { type: 'checkpoint' }>;
  index: number;
  onAnswer: (index: number, correct: boolean, prompt: string) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);

  function choose(i: number) {
    if (chosen !== null) return; // the first answer is the one that counts
    setChosen(i);
    onAnswer(index, block.options[i].correct === true, block.question);
  }

  return (
    <section className="panel stack stack-4" style={{ borderLeft: '3px solid var(--skill-listening)' }}>
      <p className="eyebrow">Checkpoint</p>
      <p style={{ fontFamily: 'var(--font-reading)', fontSize: '1.0625rem', lineHeight: 1.6 }}>{block.question}</p>

      <ul className="stack stack-2" style={{ listStyle: 'none', padding: 0 }} role="radiogroup" aria-label="Checkpoint options">
        {block.options.map((option, i) => {
          const selected = chosen === i;
          const revealed = chosen !== null;
          return (
            <li key={i}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className="runner-option"
                onClick={() => choose(i)}
                data-selected={selected || undefined}
                style={{
                  borderColor: revealed && option.correct ? 'var(--positive)' : undefined,
                  background:
                    revealed && option.correct
                      ? 'var(--positive-soft)'
                      : selected && !option.correct
                        ? 'var(--critical-soft)'
                        : undefined,
                }}
              >
                <span className="runner-option-key numeric" aria-hidden>
                  {i + 1}
                </span>
                <span>{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {chosen !== null ? (
        <div className="inset stack stack-2" aria-live="polite">
          <p className="eyebrow">{block.options[chosen].correct ? 'Right' : 'Not this one'}</p>
          <p className="small">{block.options[chosen].feedback}</p>
          {!block.options[chosen].correct ? (
            <p className="small muted">
              The answer is “{block.options.find((o) => o.correct)?.text}” —{' '}
              {block.options.find((o) => o.correct)?.feedback}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="tiny faint" id={`checkpoint-${index}`}>
          Commit to an answer before reading on. Guessing and being corrected teaches more than reading the
          explanation first.
        </p>
      )}
    </section>
  );
}

function Drill({ block }: { block: Extract<LessonBlock, { type: 'drill' }> }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [attempts, setAttempts] = useState<Record<number, string>>({});

  return (
    <section className="panel stack stack-4" style={{ borderLeft: '3px solid var(--skill-writing)' }}>
      <div className="stack stack-2">
        <p className="eyebrow">Drill</p>
        <p className="small">{block.instruction}</p>
      </div>

      <ol className="stack stack-4" style={{ listStyle: 'none', padding: 0 }}>
        {block.items.map((item, i) => (
          <li key={i} className="stack stack-2">
            <p className="small" style={{ fontFamily: 'var(--font-reading)' }}>
              {item.prompt}
            </p>
            <div className="row wrap" style={{ gap: 'var(--s2)' }}>
              <input
                className="input"
                style={{ maxWidth: '26rem' }}
                value={attempts[i] ?? ''}
                onChange={(e) => setAttempts((a) => ({ ...a, [i]: e.target.value }))}
                placeholder="Your answer"
                aria-label={`Answer for item ${i + 1}`}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                disabled={!attempts[i]?.trim() && !revealed[i]}
              >
                {revealed[i] ? 'Shown' : 'Check'}
              </button>
            </div>
            {revealed[i] ? (
              <div className="inset stack stack-1">
                <p className="small">
                  <strong>{item.answer}</strong>
                </p>
                {item.note ? <p className="tiny muted">{item.note}</p> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
