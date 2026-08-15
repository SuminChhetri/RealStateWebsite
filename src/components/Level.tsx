import { ESTIMATE_DISCLAIMER, levelBand, evidenceQuality } from '@/lib/content/clb';

const MIN = 5;
const MAX = 12;

function pct(level: number): number {
  return ((Math.min(MAX, Math.max(MIN, level)) - MIN) / (MAX - MIN)) * 100;
}

/**
 * The level scale. It shows three things at once: the point estimate, the
 * uncertainty around it, and the target. Showing uncertainty is not a
 * decoration — a learner who reads "CLB 9" as a fact will be surprised on test
 * day in a way that a learner who reads "CLB 8–10, firming up" will not.
 */
export function LevelScale({
  level,
  se,
  target,
  observations,
  label,
  emptyNote = 'No evidence yet — practise this skill to place it on the scale.',
}: {
  level: number;
  se: number;
  target?: number;
  observations: number;
  label?: string;
  /** Pass null where the surrounding surface already says what to do next. */
  emptyNote?: string | null;
}) {
  if (!observations || !level) {
    return (
      <div className="stack stack-2">
        {label ? <p className="eyebrow">{label}</p> : null}
        <div className="scale" aria-hidden>
          {target ? <span className="scale-target" style={{ left: `${pct(target)}%` }} /> : null}
        </div>
        <div className="scale-ticks" aria-hidden>
          {[5, 6, 7, 8, 9, 10, 11, 12].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        {emptyNote ? <p className="tiny faint">{emptyNote}</p> : null}
      </div>
    );
  }

  const band = levelBand(level, se);
  const quality = evidenceQuality(observations, se);
  const low = pct(level - se);
  const high = pct(level + se);

  return (
    <div className="stack stack-2">
      {label ? <p className="eyebrow">{label}</p> : null}
      <div
        className="scale"
        role="img"
        aria-label={`Estimated ${band.label}${target ? `, target CLB ${target}` : ''}. ${quality.label}.`}
      >
        <span className="scale-band" style={{ left: `${low}%`, width: `${Math.max(1.5, high - low)}%` }} />
        <span className="scale-point" style={{ left: `${pct(level)}%` }} />
        {target ? <span className="scale-target" style={{ left: `${pct(target)}%` }} /> : null}
      </div>
      <div className="scale-ticks" aria-hidden>
        {[5, 6, 7, 8, 9, 10, 11, 12].map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function EstimateLabel({
  level,
  se,
  observations,
  size = 'md',
}: {
  level: number;
  se: number;
  observations: number;
  size?: 'md' | 'lg';
}) {
  if (!observations || !level) {
    return <span className="muted">Not measured</span>;
  }
  const band = levelBand(level, se);
  const quality = evidenceQuality(observations, se);
  return (
    <span className="row-tight wrap" style={{ alignItems: 'baseline', minWidth: 0 }}>
      <span
        className="serif numeric"
        style={{ fontSize: size === 'lg' ? '2rem' : '1.35rem', lineHeight: 1.1 }}
      >
        {level.toFixed(1)}
      </span>
      <span className="small muted nowrap">{band.label}</span>
      <span className={`badge ${quality.key === 'solid' ? 'badge-positive' : quality.key === 'provisional' ? 'badge-caution' : ''}`}>
        {quality.label}
      </span>
    </span>
  );
}

export function EstimateFootnote() {
  return <p className="tiny faint">{ESTIMATE_DISCLAIMER}</p>;
}
