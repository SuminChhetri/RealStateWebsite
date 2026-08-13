'use client';

import { useMemo, useState } from 'react';

export interface VocabularyItem {
  id: string;
  headword: string;
  pos: string;
  definition: string;
  example: string;
  collocations: string[];
  usefulFor: string[];
  pitfall: string | null;
  register: string;
  level: number;
}

/**
 * Vocabulary practice as production, not recognition.
 *
 * The card shows the meaning and the context and asks the learner to produce
 * the word. Recognising a word in a list of four is a much weaker test than
 * retrieving it from a definition, and only the second predicts being able to
 * use it in a timed response.
 */
export function VocabularyTrainer({ entries }: { entries: VocabularyItem[] }) {
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, 'got' | 'missed'>>({});

  const entry = entries[index];
  const done = Object.keys(results).length;
  const correct = Object.values(results).filter((r) => r === 'got').length;

  const maskedExample = useMemo(() => {
    if (!entry) return '';
    const head = entry.headword.split(' ')[0];
    const pattern = new RegExp(head.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, Math.max(4, head.length - 3)) + '\\w*', 'gi');
    return entry.example.replace(pattern, '______');
  }, [entry]);

  if (!entries.length) {
    return (
      <div className="empty">
        <h3>No entries at your level yet</h3>
        <p className="small">Complete the diagnostic so vocabulary can be pitched at the right band.</p>
      </div>
    );
  }

  const grade = (got: boolean) => {
    setResults((r) => ({ ...r, [entry.id]: got ? 'got' : 'missed' }));
    setRevealed(false);
    setAttempt('');
    setIndex((i) => (i + 1) % entries.length);
  };

  const matches =
    attempt.trim().toLowerCase() === entry.headword.toLowerCase() ||
    entry.headword.toLowerCase().startsWith(attempt.trim().toLowerCase()) && attempt.trim().length >= 4;

  return (
    <div className="panel stack stack-5">
      <div className="row-between wrap">
        <p className="eyebrow">
          Card {index + 1} of {entries.length}
        </p>
        <p className="tiny faint numeric">
          {done ? `${correct}/${done} produced from memory` : 'Produce the word from its meaning'}
        </p>
      </div>

      <div className="stack stack-3">
        <p className="small muted">{entry.definition}</p>
        <p className="passage" style={{ maxWidth: '100%' }}>
          {maskedExample}
        </p>
        <div className="row-tight wrap">
          <span className="badge">{entry.pos}</span>
          <span className="badge">{entry.register}</span>
          <span className="badge numeric">CLB {entry.level}</span>
        </div>
      </div>

      {!revealed ? (
        <div className="stack stack-3">
          <div className="row wrap" style={{ gap: 'var(--s2)' }}>
            <input
              className="input"
              style={{ maxWidth: '20rem' }}
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setRevealed(true);
              }}
              placeholder="The word"
              aria-label="Your answer"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="button" className="btn" onClick={() => setRevealed(true)}>
              Check
            </button>
          </div>
          <p className="tiny faint">
            Say it aloud before you type it. Producing a word is the test that predicts using it under pressure.
          </p>
        </div>
      ) : (
        <div className="stack stack-4">
          <div className="inset stack stack-3">
            <div className="row-tight">
              <p className="serif" style={{ fontSize: '1.35rem' }}>
                {entry.headword}
              </p>
              {attempt ? (
                <span className={`badge ${matches ? 'badge-positive' : 'badge-critical'}`}>
                  {matches ? 'You had it' : `You wrote “${attempt}”`}
                </span>
              ) : null}
            </div>
            <p className="small" style={{ fontFamily: 'var(--font-reading)' }}>
              {entry.example}
            </p>
            {entry.collocations.length ? (
              <p className="small muted">
                <strong>Goes with: </strong>
                {entry.collocations.join(' · ')}
              </p>
            ) : null}
            {entry.usefulFor.length ? (
              <p className="tiny faint">
                Earns points in: {entry.usefulFor.map((u) => u.replace('.', ' · ')).join(', ')}
              </p>
            ) : null}
            {entry.pitfall ? (
              <p className="small" style={{ color: 'var(--caution)' }}>
                {entry.pitfall}
              </p>
            ) : null}
          </div>

          <div className="row wrap">
            <button type="button" className="btn btn-primary" onClick={() => grade(true)}>
              I produced it
            </button>
            <button type="button" className="btn" onClick={() => grade(false)}>
              I did not
            </button>
          </div>
          <p className="tiny faint">
            Grade yourself honestly — recognising a word once you see it is not the same as producing it, and only
            the second one shows up in your writing.
          </p>
        </div>
      )}
    </div>
  );
}
