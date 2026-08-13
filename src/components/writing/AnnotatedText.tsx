'use client';

import { useState } from 'react';
import type { UsageFinding } from '@/lib/engines/usage-rules';

/**
 * The learner's own text with the flagged spans marked in place.
 *
 * Marking in place matters: a list of errors detached from the sentence they
 * occurred in is a list to skim. A highlight the learner has to click, inside
 * their own paragraph, is a moment of retrieval.
 */
export function AnnotatedText({ text, findings }: { text: string; findings: UsageFinding[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (!findings.length) {
    return (
      <div className="stack stack-4">
        <p className="small muted">
          No patterns from the rule set fired in this response. That is a good sign, and not a guarantee: the
          checker covers frequent errors precisely rather than covering everything.
        </p>
        <div className="passage" style={{ maxWidth: '100%' }}>
          {text.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    );
  }

  // Sort and drop overlaps so the rendering is a clean partition of the text.
  const sorted = [...findings].sort((a, b) => a.span[0] - b.span[0]);
  const kept: UsageFinding[] = [];
  let cursor = 0;
  for (const finding of sorted) {
    if (finding.span[0] >= cursor) {
      kept.push(finding);
      cursor = finding.span[1];
    }
  }

  const nodes: React.ReactNode[] = [];
  let position = 0;
  kept.forEach((finding, index) => {
    if (finding.span[0] > position) {
      nodes.push(<span key={`t${index}`}>{text.slice(position, finding.span[0])}</span>);
    }
    nodes.push(
      <button
        key={`f${index}`}
        type="button"
        className="excerpt"
        onClick={() => setActive(active === index ? null : index)}
        style={{
          border: 'none',
          cursor: 'pointer',
          font: 'inherit',
          background:
            finding.severity === 'high'
              ? 'var(--critical-soft)'
              : finding.severity === 'medium'
                ? 'var(--caution-soft)'
                : 'var(--neutral-soft)',
          outline: active === index ? '2px solid var(--accent)' : 'none',
        }}
        aria-expanded={active === index}
      >
        {text.slice(finding.span[0], finding.span[1])}
      </button>,
    );
    position = finding.span[1];
  });
  if (position < text.length) nodes.push(<span key="tail">{text.slice(position)}</span>);

  return (
    <div className="stack stack-4">
      <p className="tiny faint">Click a highlight to see what the rule found.</p>

      <div className="passage" style={{ maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
        {nodes}
      </div>

      {active !== null ? (
        <div className="finding stack stack-2" data-severity={kept[active].severity}>
          <p className="eyebrow">{kept[active].severity} priority</p>
          <p className="small">{kept[active].message}</p>
          <p className="small muted">{kept[active].suggestion}</p>
        </div>
      ) : null}

      <details>
        <summary className="small" style={{ cursor: 'pointer' }}>
          List all {kept.length} findings
        </summary>
        <ul className="stack stack-3" style={{ marginTop: 'var(--s4)', listStyle: 'none', padding: 0 }}>
          {kept.map((finding, i) => (
            <li key={i} className="finding stack stack-1" data-severity={finding.severity}>
              <p className="small">
                <span className="excerpt">{finding.excerpt}</span>
              </p>
              <p className="small">{finding.message}</p>
              <p className="tiny muted">{finding.suggestion}</p>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
