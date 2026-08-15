'use client';

import { useState } from 'react';

/**
 * Account deletion.
 *
 * The interaction is deliberately slow. It is collapsed by default, opening it
 * is a separate decision from confirming it, and the confirm button stays
 * disabled until the learner has typed their own email address — which cannot
 * happen by a mis-click, a stray Enter key, or a screen reader user landing on
 * a focused button they did not mean to activate.
 *
 * What is being deleted is listed explicitly rather than summarised as "your
 * data", because someone who has spent forty hours here deserves to know that
 * the forty hours are what is going.
 */
export function DangerZone({
  email,
  deleteAction,
}: {
  email: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase() && email.length > 0;

  return (
    <section className="danger-zone">
      <div className="stack stack-3">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Delete your account
          </h2>
        </div>

        <p className="small measure-wide">
          This removes everything and cannot be undone: your profile and estimates, every practice set and mock
          section, your writing and speaking submissions and their recordings, your mistake bank, your review
          schedule, your lesson history, and your progress record.
        </p>

        {!open ? (
          <div>
            <button className="btn btn-danger" type="button" onClick={() => setOpen(true)}>
              Delete account…
            </button>
          </div>
        ) : (
          <form action={deleteAction} className="stack stack-4">
            <div className="field">
              <label htmlFor="confirmEmail">
                Type <strong>{email}</strong> to confirm
              </label>
              <input
                className="input"
                id="confirmEmail"
                name="confirmEmail"
                autoComplete="off"
                spellCheck={false}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={email}
                style={{ maxWidth: '22rem' }}
                aria-describedby="confirm-help"
              />
              <p className="tiny faint" id="confirm-help">
                The button stays disabled until this matches exactly.
              </p>
            </div>
            <div className="row-tight wrap">
              <button className="btn btn-danger" type="submit" disabled={!matches}>
                Delete my account permanently
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setOpen(false);
                  setTyped('');
                }}
              >
                Keep my account
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
