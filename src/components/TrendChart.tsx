/**
 * A trend of level estimates with the uncertainty band drawn behind the line.
 *
 * The band is the point. A line alone invites a learner to read a 0.2 movement
 * as progress; with the interval visible, it is obvious when two points are not
 * distinguishable, and equally obvious when a real change has happened.
 */
export function TrendChart({
  points,
  target,
  height = 130,
  label,
}: {
  points: { level: number; se: number; createdAt: number }[];
  target?: number;
  height?: number;
  label: string;
}) {
  if (points.length < 2) {
    return (
      <div
        className="inset"
        style={{ height, display: 'grid', placeItems: 'center', textAlign: 'center' }}
      >
        <p className="small muted" style={{ maxWidth: '20rem' }}>
          {points.length === 1
            ? 'One measurement so far. A trend needs at least two — practise again to see movement.'
            : 'No measurements yet.'}
        </p>
      </div>
    );
  }

  const width = 640;
  const padX = 8;
  const padY = 10;
  const minLevel = 5;
  const maxLevel = 12;

  const x = (i: number) => padX + (i / (points.length - 1)) * (width - padX * 2);
  const y = (level: number) =>
    padY + ((maxLevel - Math.min(maxLevel, Math.max(minLevel, level))) / (maxLevel - minLevel)) * (height - padY * 2);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.level).toFixed(1)}`).join(' ');
  const bandTop = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.level + p.se).toFixed(1)}`).join(' ');
  const bandBottom = points
    .slice()
    .reverse()
    .map((p, i) => `L ${x(points.length - 1 - i).toFixed(1)} ${y(p.level - p.se).toFixed(1)}`)
    .join(' ');

  const first = points[0];
  const last = points[points.length - 1];
  const change = last.level - first.level;
  // Movement is only reported as real when it exceeds the combined uncertainty.
  const meaningful = Math.abs(change) > Math.sqrt(first.se ** 2 + last.se ** 2);

  return (
    <figure className="stack stack-2" style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`${label}: ${points.length} measurements from CLB ${first.level.toFixed(1)} to CLB ${last.level.toFixed(1)}.`}
        preserveAspectRatio="none"
      >
        {[6, 8, 10, 12].map((level) => (
          <g key={level}>
            <line
              x1={padX}
              x2={width - padX}
              y1={y(level)}
              y2={y(level)}
              stroke="var(--rule-faint)"
              strokeWidth={1}
            />
            <text x={padX} y={y(level) - 3} fontSize={9} fill="var(--ink-tertiary)">
              {level}
            </text>
          </g>
        ))}

        {target ? (
          <line
            x1={padX}
            x2={width - padX}
            y1={y(target)}
            y2={y(target)}
            stroke="var(--ink-tertiary)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ) : null}

        <path d={`${bandTop} ${bandBottom} Z`} fill="var(--accent-soft)" />
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.level)} r={2.5} fill="var(--accent)" />
        ))}
      </svg>

      <figcaption className="tiny muted">
        {meaningful
          ? `${change > 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(1)} levels across ${points.length} measurements — larger than the uncertainty, so this is real movement.`
          : `Change of ${change.toFixed(1)} across ${points.length} measurements, which is within the uncertainty band. Not yet distinguishable from noise.`}
      </figcaption>
    </figure>
  );
}
