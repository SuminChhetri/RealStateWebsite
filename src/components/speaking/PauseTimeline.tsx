import { segmentEnvelope } from '@/lib/engines/speaking-eval';

/**
 * A visualisation that answers one question: where did the response stop
 * moving? Speech runs are drawn as filled bars, pauses of 400 ms or more as
 * gaps, and pauses long enough to be noticeable to a listener are marked.
 *
 * This is not decoration. A learner who sees that their silences cluster in the
 * second half now knows their planning ran out, which is a different fix from
 * hesitation spread evenly through the response.
 */
export function PauseTimeline({
  envelope,
  durationMs,
  speakSeconds,
}: {
  envelope: { tMs: number; rms: number }[];
  durationMs: number;
  speakSeconds: number;
}) {
  const total = Math.max(durationMs, 1);
  const segments = segmentEnvelope(envelope, total);
  const sorted = [...envelope].map((e) => e.rms).sort((a, b) => a - b);
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0.01;
  const floor = sorted[Math.floor(sorted.length * 0.1)] || 0;
  const threshold = Math.max(floor * 1.6, p90 * 0.18, 0.008);

  const windowMs = speakSeconds * 1000;
  const scale = Math.max(total, windowMs);

  return (
    <div className="stack stack-3">
      <div
        style={{
          position: 'relative',
          height: 44,
          background: 'var(--paper-sunken)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}
        role="img"
        aria-label={`Speech and silence over ${Math.round(total / 1000)} seconds: ${segments.pauses.length} pauses, longest ${(segments.longestPauseMs / 1000).toFixed(1)} seconds.`}
      >
        {envelope.map((sample, i) => {
          const next = envelope[i + 1];
          const width = ((next ? next.tMs - sample.tMs : 40) / scale) * 100;
          const speaking = sample.rms >= threshold;
          const height = speaking ? Math.min(100, 25 + (sample.rms / Math.max(p90, 0.001)) * 60) : 0;
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${(sample.tMs / scale) * 100}%`,
                width: `${Math.max(width, 0.15)}%`,
                bottom: 0,
                height: `${height}%`,
                background: speaking ? 'var(--skill-speaking)' : 'transparent',
                opacity: 0.85,
              }}
            />
          );
        })}

        {segments.pauses
          .filter((p) => p.durationMs >= 900)
          .map((pause, i) => (
            <span
              key={`p${i}`}
              title={`${(pause.durationMs / 1000).toFixed(1)}s pause`}
              style={{
                position: 'absolute',
                left: `${(pause.startMs / scale) * 100}%`,
                width: `${Math.max(0.4, (pause.durationMs / scale) * 100)}%`,
                top: 0,
                bottom: 0,
                background: 'var(--caution-soft)',
                borderLeft: '1px solid var(--caution)',
              }}
            />
          ))}

        {total < windowMs ? (
          <span
            style={{
              position: 'absolute',
              left: `${(total / scale) * 100}%`,
              right: 0,
              top: 0,
              bottom: 0,
              background: 'var(--critical-soft)',
            }}
            title="Unused time"
          />
        ) : null}
      </div>

      <div className="row wrap" style={{ gap: 'var(--s4)' }}>
        <span className="tiny muted">
          <span
            aria-hidden
            style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--skill-speaking)', borderRadius: 2, marginRight: 4 }}
          />
          speech
        </span>
        <span className="tiny muted">
          <span
            aria-hidden
            style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--caution-soft)', border: '1px solid var(--caution)', borderRadius: 2, marginRight: 4 }}
          />
          pause over 0.9s
        </span>
        {total < windowMs ? (
          <span className="tiny muted">
            <span
              aria-hidden
              style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--critical-soft)', borderRadius: 2, marginRight: 4 }}
            />
            unused time ({Math.round((windowMs - total) / 1000)}s)
          </span>
        ) : null}
      </div>
    </div>
  );
}
