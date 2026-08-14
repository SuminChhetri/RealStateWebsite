'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScriptPlayer, type ScriptTurn } from './ScriptPlayer';

/**
 * The test runner.
 *
 * This surface is deliberately unlike the rest of the product: no sidebar, no
 * recommendations, no progress charts. Under time pressure every element that
 * is not the passage, the question, or the clock is a cost. What remains is
 * one row of state at the top and the work itself.
 *
 * Answers are held in component state and persisted to sessionStorage on every
 * change, so a reload mid-set does not lose work.
 */

export interface RunnerQuestion {
  id: string;
  prompt: string;
  format: string;
  options: { key: string; text: string }[];
  microSkill: string;
  targetSeconds: number;
  stimulusId: string | null;
  origin: 'authored' | 'generated';
}

export interface RunnerStimulus {
  id: string;
  title: string;
  partType: string;
  skill: string;
  body: string | null;
  script: ScriptTurn[] | null;
  figure: { kind: string; caption: string; columns: string[]; rows: string[][]; note?: string } | null;
}

interface Answer {
  response: string | null;
  elapsedMs: number;
  changedAnswer: boolean;
  flagged: boolean;
}

export function Runner({
  attemptId,
  mode,
  skill,
  timed,
  timeLimitSeconds,
  questions,
  stimuli,
  submitAction,
}: {
  attemptId: string;
  mode: string;
  skill: string;
  timed: boolean;
  timeLimitSeconds: number | null;
  questions: RunnerQuestion[];
  stimuli: RunnerStimulus[];
  submitAction: (payload: unknown) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const storageKey = `meridian:attempt:${attemptId}`;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [remaining, setRemaining] = useState(timeLimitSeconds ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<'stimulus' | 'question'>('stimulus');
  const [confirming, setConfirming] = useState(false);

  const itemStart = useRef<number>(Date.now());
  const submitted = useRef(false);

  const question = questions[index];
  const stimulus = useMemo(
    () => stimuli.find((s) => s.id === question?.stimulusId) ?? null,
    [stimuli, question],
  );

  /* ---- restore in-progress work ---- */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) setAnswers(JSON.parse(raw) as Record<string, Answer>);
    } catch {
      /* a corrupt cache is not worth failing the session over */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {
      /* storage may be unavailable in private mode; answers still submit */
    }
  }, [answers, storageKey]);

  const answered = Object.values(answers).filter((a) => a.response).length;

  const doSubmit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);

    const now = Date.now();
    const payload = {
      attemptId,
      responses: questions.map((q) => {
        const a = answers[q.id];
        const extra = q.id === question?.id ? now - itemStart.current : 0;
        return {
          questionId: q.id,
          response: a?.response ?? null,
          elapsedMs: Math.min(3_600_000, (a?.elapsedMs ?? 0) + extra),
          changedAnswer: a?.changedAnswer ?? false,
          flagged: a?.flagged ?? false,
        };
      }),
    };

    const result = await submitAction(payload);
    if (!result.ok) {
      submitted.current = false;
      setSubmitting(false);
      setError(result.error ?? 'Submission failed.');
      return;
    }
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    router.push(`/session/${attemptId}/results`);
  }, [answers, attemptId, question?.id, questions, router, storageKey, submitAction]);

  /* ---- countdown ---- */
  useEffect(() => {
    if (!timed || !timeLimitSeconds) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          void doSubmit();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timed, timeLimitSeconds, doSubmit]);

  const commitTime = useCallback(
    (questionId: string) => {
      const spent = Date.now() - itemStart.current;
      itemStart.current = Date.now();
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          response: prev[questionId]?.response ?? null,
          elapsedMs: (prev[questionId]?.elapsedMs ?? 0) + spent,
          changedAnswer: prev[questionId]?.changedAnswer ?? false,
          flagged: prev[questionId]?.flagged ?? false,
        },
      }));
    },
    [],
  );

  const goto = useCallback(
    (next: number) => {
      if (!question) return;
      commitTime(question.id);
      setIndex(Math.max(0, Math.min(questions.length - 1, next)));
      setMobilePane('question');
    },
    [commitTime, question, questions.length],
  );

  const choose = useCallback(
    (optionKey: string) => {
      if (!question) return;
      setAnswers((prev) => {
        const existing = prev[question.id];
        return {
          ...prev,
          [question.id]: {
            response: optionKey,
            elapsedMs: existing?.elapsedMs ?? 0,
            changedAnswer: !!existing?.response && existing.response !== optionKey,
            flagged: existing?.flagged ?? false,
          },
        };
      });
    },
    [question],
  );

  const toggleFlag = useCallback(() => {
    if (!question) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        response: prev[question.id]?.response ?? null,
        elapsedMs: prev[question.id]?.elapsedMs ?? 0,
        changedAnswer: prev[question.id]?.changedAnswer ?? false,
        flagged: !prev[question.id]?.flagged,
      },
    }));
  }, [question]);

  /* ---- keyboard: the fastest way through a set ---- */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowRight' || event.key === 'n') goto(index + 1);
      else if (event.key === 'ArrowLeft' || event.key === 'p') goto(index - 1);
      else if (event.key === 'f') toggleFlag();
      else if (/^[1-9]$/.test(event.key)) {
        const option = question?.options[Number(event.key) - 1];
        if (option) choose(option.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [choose, goto, index, question, toggleFlag]);

  if (!question) return null;

  const timeLow = timed && remaining <= 60;
  const isListening = skill === 'listening' || stimulus?.skill === 'listening';

  return (
    <div className="runner">
      <header className="runner-bar">
        <div className="row-tight">
          <span className="eyebrow">{modeLabel(mode)}</span>
          <span className="runner-progress numeric">
            {index + 1} / {questions.length}
          </span>
        </div>

        <div className="runner-dots" role="group" aria-label="Question navigation">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const status = a?.flagged ? 'flagged' : a?.response ? 'answered' : 'empty';
            return (
              <button
                key={q.id}
                type="button"
                className="runner-dot"
                data-status={status}
                data-current={i === index || undefined}
                onClick={() => goto(i)}
                aria-label={`Question ${i + 1}, ${status}`}
                aria-current={i === index ? 'true' : undefined}
              />
            );
          })}
        </div>

        <div className="row-tight">
          {timed ? (
            <span className={`runner-clock numeric ${timeLow ? 'is-low' : ''}`} aria-live="off">
              {formatTime(remaining)}
            </span>
          ) : (
            <span className="tiny faint">Untimed</span>
          )}
          <button type="button" className="btn btn-sm" onClick={() => setConfirming(true)}>
            Finish
          </button>
        </div>
      </header>

      <div className="runner-mobile-tabs">
        <button
          type="button"
          data-active={mobilePane === 'stimulus' || undefined}
          onClick={() => setMobilePane('stimulus')}
        >
          {isListening ? 'Audio' : 'Passage'}
        </button>
        <button
          type="button"
          data-active={mobilePane === 'question' || undefined}
          onClick={() => setMobilePane('question')}
        >
          Question {index + 1}
        </button>
      </div>

      <div className="runner-body" data-pane={mobilePane}>
        <section className="runner-stimulus" aria-label={isListening ? 'Audio' : 'Passage'}>
          {stimulus ? (
            <div className="stack stack-4">
              <div className="stack stack-1">
                <p className="eyebrow">{partLabel(stimulus.partType)}</p>
                <h2 className="serif" style={{ fontSize: '1.15rem' }}>
                  {stimulus.title}
                </h2>
              </div>

              {stimulus.script ? (
                <ScriptPlayer turns={stimulus.script} audioUrl={null} allowReplay={!timed} />
              ) : null}

              {stimulus.figure ? (
                <div className="table-wrap panel-quiet" style={{ padding: 'var(--s4)' }}>
                  <table className="data">
                    <caption>{stimulus.figure.caption}</caption>
                    <thead>
                      <tr>
                        {stimulus.figure.columns.map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stimulus.figure.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className={j > 0 ? 'num' : undefined}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stimulus.figure.note ? (
                    <p className="small muted" style={{ marginTop: 'var(--s3)' }}>
                      {stimulus.figure.note}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {stimulus.body ? (
                <div className="passage passage-scroll">{renderBody(stimulus.body)}</div>
              ) : null}
            </div>
          ) : (
            <div className="stack stack-3">
              <p className="eyebrow">No passage</p>
              <p className="small muted">This item stands alone.</p>
            </div>
          )}
        </section>

        <section className="runner-question" aria-label={`Question ${index + 1}`}>
          <div className="stack stack-5">
            <div className="stack stack-3">
              <div className="row-between">
                <div className="row-tight">
                  <p className="eyebrow">Question {index + 1}</p>
                  {question.origin === 'generated' ? (
                    <span
                      className="badge badge-quiet"
                      title="Built by the item generator from structured data rather than written by an author. The key is computed, not authored — see the explanation after you submit."
                    >
                      Generated
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={toggleFlag}
                  aria-pressed={!!answers[question.id]?.flagged}
                >
                  {answers[question.id]?.flagged ? 'Flagged' : 'Flag for review'}
                </button>
              </div>
              <p className="runner-prompt">{question.prompt}</p>
            </div>

            <ul className="runner-options" role="radiogroup" aria-label="Answer options">
              {question.options.map((option, i) => {
                const selected = answers[question.id]?.response === option.key;
                return (
                  <li key={option.key}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className="runner-option"
                      data-selected={selected || undefined}
                      onClick={() => choose(option.key)}
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

            <div className="row-between">
              <button type="button" className="btn" onClick={() => goto(index - 1)} disabled={index === 0}>
                Previous
              </button>
              {index === questions.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={() => setConfirming(true)}>
                  Finish set
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => goto(index + 1)}>
                  Next
                </button>
              )}
            </div>

            <p className="tiny faint">
              Keyboard: 1–{Math.min(9, question.options.length)} to answer, ← → to move, F to flag.
            </p>
          </div>
        </section>
      </div>

      {confirming ? (
        <div className="runner-overlay" role="dialog" aria-modal="true" aria-labelledby="finish-title">
          <div className="runner-dialog stack stack-4">
            <h2 id="finish-title" style={{ fontSize: '1.15rem' }}>
              Finish this set?
            </h2>
            <p className="small muted">
              {answered} of {questions.length} answered.
              {answered < questions.length
                ? ' Unanswered items are marked incorrect, which is how the estimate stays honest.'
                : ''}
            </p>
            {error ? <p className="error-text">{error}</p> : null}
            <div className="row wrap">
              <button type="button" className="btn btn-primary" onClick={doSubmit} disabled={submitting}>
                {submitting ? 'Marking…' : 'Finish and see feedback'}
              </button>
              <button type="button" className="btn" onClick={() => setConfirming(false)} disabled={submitting}>
                Keep working
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderBody(body: string) {
  return body.split(/\n{2,}/).map((paragraph, i) => (
    <p key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(paragraph) }} />
  ));
}

/**
 * Passages are authored in-repo, never learner-supplied, and only two inline
 * forms are supported. Any other markup is escaped before it reaches the DOM.
 */
function inlineFormat(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function modeLabel(mode: string): string {
  const map: Record<string, string> = {
    diagnostic: 'Diagnostic',
    drill: 'Targeted practice',
    section: 'Full section',
    mock: 'Simulation',
    review: 'Scheduled review',
    remediation: 'Mistake retest',
  };
  return map[mode] ?? mode;
}

function partLabel(partType: string): string {
  return partType
    .split('.')[1]
    ?.replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase()) ?? partType;
}
