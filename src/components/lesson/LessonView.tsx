'use client';

import { useState } from 'react';
import type { LessonBlock } from '@/lib/content/seed/types';

/**
 * Lesson rendering.
 *
 * The interactive blocks are the reason lessons exist in this product rather
 * than as documents: a checkpoint forces retrieval before the next idea
 * arrives, and a drill hides the answer until the learner has committed to
 * one. Reading prose about a technique produces recognition; being asked to
 * produce it produces recall.
 */
export function LessonView({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="stack stack-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} index={i} />
      ))}
    </div>
  );
}

function Block({ block, index }: { block: LessonBlock; index: number }) {
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
      return <Checkpoint block={block} index={index} />;

    case 'drill':
      return <Drill block={block} />;

    default:
      return null;
  }
}

function Checkpoint({ block, index }: { block: Extract<LessonBlock, { type: 'checkpoint' }>; index: number }) {
  const [chosen, setChosen] = useState<number | null>(null);

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
                onClick={() => setChosen(i)}
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
