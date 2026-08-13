'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The writing environment.
 *
 * Three panes matter and nothing else does: the prompt (always visible, because
 * losing a required content point is the most expensive error on this task), a
 * planning space, and the response. The word count and clock are present but
 * quiet — a counter that turns red at 149 words teaches panic, not pacing.
 *
 * Drafts persist to localStorage on every keystroke batch, so a closed tab does
 * not cost twenty-seven minutes of work.
 */
export function WritingEditor({
  taskSlug,
  requirements,
  minWords,
  maxWords,
  timeLimitSeconds,
  submitAction,
}: {
  taskSlug: string;
  requirements: string[];
  minWords: number;
  maxWords: number;
  timeLimitSeconds: number;
  submitAction: (formData: FormData) => void;
}) {
  const storageKey = `meridian:writing:${taskSlug}`;
  const [text, setText] = useState('');
  const [plan, setPlan] = useState('');
  const [started, setStarted] = useState(false);
  const [timed, setTimed] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [showPlan, setShowPlan] = useState(true);
  const revisions = useRef(0);
  const previousLength = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as { text: string; plan: string; elapsed: number };
        setText(saved.text ?? '');
        setPlan(saved.plan ?? '');
        setElapsed(saved.elapsed ?? 0);
        if (saved.text) setStarted(true);
      }
    } catch {
      /* a corrupt draft should not block writing a new one */
    }
  }, [storageKey]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ text, plan, elapsed }));
      } catch {
        /* storage unavailable; the draft still submits from memory */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [text, plan, elapsed, started, storageKey]);

  const words = (text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).length;
  const remaining = Math.max(0, timeLimitSeconds - elapsed);
  const overtime = timed && elapsed > timeLimitSeconds;

  const onChange = useCallback((value: string) => {
    // A "revision" is a deletion after text existed: a rough but honest proxy
    // for editing behaviour, reported to the learner as such.
    if (value.length < previousLength.current) revisions.current += 1;
    previousLength.current = value.length;
    setText(value);
    setStarted(true);
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        clearDraft();
        submitAction(formData);
      }}
      className="stack stack-4"
    >
      <input type="hidden" name="taskSlug" value={taskSlug} />
      <input type="hidden" name="elapsedSeconds" value={elapsed} />
      <input type="hidden" name="revisionCount" value={revisions.current} />
      <input type="hidden" name="timed" value={timed ? 'on' : ''} />
      <input type="hidden" name="planNotes" value={plan} />

      <div className="row-between wrap" style={{ gap: 'var(--s3)' }}>
        <div className="row-tight wrap">
          <span className={`badge ${words >= minWords && words <= maxWords ? 'badge-positive' : ''}`}>
            <span className="numeric">{words}</span> words
          </span>
          <span className="tiny faint">
            target {minWords}–{maxWords}
          </span>
        </div>
        <div className="row-tight">
          {timed ? (
            <span className={`badge ${remaining < 120 ? 'badge-caution' : ''} numeric`}>
              {overtime ? `+${format(elapsed - timeLimitSeconds)} over` : format(remaining)}
            </span>
          ) : (
            <span className="badge numeric">{format(elapsed)} elapsed</span>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setTimed((v) => !v)}
            aria-pressed={timed}
          >
            {timed ? 'Timed' : 'Untimed'}
          </button>
        </div>
      </div>

      <div className="writing-grid">
        <aside className="writing-side stack stack-4">
          <div className="panel-quiet stack stack-3">
            <div className="row-between">
              <p className="eyebrow">Required content</p>
              <span className="tiny faint numeric">
                {Object.values(checked).filter(Boolean).length}/{requirements.length}
              </span>
            </div>
            <ul className="stack stack-2" style={{ listStyle: 'none', padding: 0 }}>
              {requirements.map((requirement, i) => (
                <li key={i}>
                  <label className="row-tight" style={{ alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!checked[i]}
                      onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <span
                      className="small"
                      style={{
                        color: checked[i] ? 'var(--ink-tertiary)' : 'var(--ink)',
                        textDecoration: checked[i] ? 'line-through' : 'none',
                      }}
                    >
                      {requirement}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="tiny faint">
              Ticking these is for you — the analyser checks coverage independently from your text.
            </p>
          </div>

          <div className="panel-quiet stack stack-3">
            <div className="row-between">
              <p className="eyebrow">Planning</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPlan((v) => !v)}>
                {showPlan ? 'Hide' : 'Show'}
              </button>
            </div>
            {showPlan ? (
              <>
                <textarea
                  className="textarea"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder={'One line per paragraph:\n1. purpose\n2. detail + why it matters\n3. what I want to happen'}
                  rows={6}
                  aria-label="Planning notes"
                />
                <p className="tiny faint">
                  Notes are saved with the submission for your own review. They are never scored.
                </p>
              </>
            ) : null}
          </div>
        </aside>

        <div className="writing-main stack stack-3">
          <label className="visually-hidden" htmlFor="response">
            Your response
          </label>
          <textarea
            id="response"
            name="text"
            className="writing-textarea"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Begin writing. The clock starts on your first keystroke."
            spellCheck={false}
            required
          />
          <p className="tiny faint">
            Spellcheck is off, as it is in the test. Your draft is saved in this browser as you type.
          </p>
        </div>
      </div>

      <div className="row wrap">
        <button className="btn btn-primary btn-lg" type="submit" disabled={words < 20}>
          Submit for analysis
        </button>
        {words < 20 ? <span className="small muted">Write at least 20 words to submit.</span> : null}
        {words > 0 && words < minWords ? (
          <span className="small" style={{ color: 'var(--caution)' }}>
            Below the target length — this caps the estimate, as it would in the test.
          </span>
        ) : null}
      </div>
    </form>
  );
}

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
