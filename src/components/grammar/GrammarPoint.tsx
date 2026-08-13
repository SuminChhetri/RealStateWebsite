'use client';

import { useState } from 'react';

interface Contrast {
  wrong: string;
  right: string;
  why: string;
}

interface Drill {
  prompt: string;
  answer: string;
  alternatives?: string[];
  explanation: string;
}

/**
 * A grammar point is presented as a contrast, then as production. Reading a
 * rule and recognising a correct sentence are both far weaker than producing
 * the form, so the drill is the part that matters and it does not reveal its
 * answer until the learner has committed.
 */
export function GrammarPoint({
  slug,
  title,
  explanation,
  contrasts,
  drills,
  level,
  occurrences,
}: {
  slug: string;
  title: string;
  explanation: string;
  contrasts: Contrast[];
  drills: Drill[];
  level: number;
  occurrences: number;
}) {
  const [open, setOpen] = useState(occurrences > 0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const isCorrect = (index: number) => {
    const drill = drills[index];
    const given = (answers[index] ?? '').trim().toLowerCase().replace(/[.,]$/, '');
    if (!given) return false;
    const accepted = [drill.answer, ...(drill.alternatives ?? [])].map((a) =>
      a.trim().toLowerCase().replace(/[.,]$/, ''),
    );
    return accepted.some((a) => a === given || a.includes(given) === false && given.includes(a));
  };

  return (
    <article id={slug} className="panel" data-skill="grammar" style={{ scrollMarginTop: '2rem' }}>
      <div className="stack stack-4">
        <div className="row-between wrap">
          <h3 className="row-tight serif" style={{ fontSize: '1.2rem' }}>
            {title}
          </h3>
          <div className="row-tight">
            <span className="badge numeric">CLB {level}</span>
            {occurrences > 0 ? (
              <span className="badge badge-critical numeric">×{occurrences} in your work</span>
            ) : null}
          </div>
        </div>

        <p className="small measure-wide">{explanation}</p>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Not this</th>
                <th scope="col">This</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              {contrasts.map((contrast, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--critical)', fontFamily: 'var(--font-reading)' }}>{contrast.wrong}</td>
                  <td style={{ fontFamily: 'var(--font-reading)' }}>{contrast.right}</td>
                  <td className="small muted">{contrast.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {drills.length ? (
          <>
            <button type="button" className="btn btn-sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {open ? 'Hide drill' : `Drill it (${drills.length} items)`}
            </button>

            {open ? (
              <ol className="stack stack-4" style={{ listStyle: 'none', padding: 0 }}>
                {drills.map((drill, i) => (
                  <li key={i} className="stack stack-2">
                    <p className="small" style={{ fontFamily: 'var(--font-reading)' }}>
                      {drill.prompt}
                    </p>
                    <div className="row wrap" style={{ gap: 'var(--s2)' }}>
                      <input
                        className="input"
                        style={{ maxWidth: '24rem' }}
                        value={answers[i] ?? ''}
                        onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setChecked((c) => ({ ...c, [i]: true }));
                        }}
                        placeholder="Your answer"
                        aria-label={`Answer ${i + 1}`}
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setChecked((c) => ({ ...c, [i]: true }))}
                        disabled={!answers[i]?.trim()}
                      >
                        Check
                      </button>
                    </div>
                    {checked[i] ? (
                      <div className="inset stack stack-1">
                        <p className="small">
                          <span
                            className={`badge ${isCorrect(i) ? 'badge-positive' : 'badge-caution'}`}
                            style={{ marginRight: 'var(--s2)' }}
                          >
                            {isCorrect(i) ? 'Yes' : 'Not quite'}
                          </span>
                          <strong>{drill.answer}</strong>
                          {drill.alternatives?.length ? (
                            <span className="muted"> (also: {drill.alternatives.join(', ')})</span>
                          ) : null}
                        </p>
                        <p className="tiny muted">{drill.explanation}</p>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}
