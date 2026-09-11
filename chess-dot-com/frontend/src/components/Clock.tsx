import { formatClock } from '../lib/time/controls';

/** One side's clock. Turns urgent under ten seconds. */
export function Clock({
  ms,
  active,
  label,
  flagged,
}: {
  ms: number;
  active: boolean;
  label: string;
  flagged?: boolean;
}) {
  const low = ms <= 10_000;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-1.5 transition-colors ${
        flagged
          ? 'border-tag-blunder/70 bg-tag-blunder/15'
          : active
            ? 'border-accent bg-accent/15'
            : 'border-line bg-panel'
      }`}
    >
      <span className="text-xs text-ink-soft">{label}</span>
      <span
        className={`font-mono text-xl font-bold tabular-nums ${
          flagged ? 'text-tag-blunder' : low && active ? 'text-tag-blunder' : 'text-ink'
        }`}
      >
        {flagged ? '0.0' : formatClock(ms)}
      </span>
    </div>
  );
}

/** A single countdown bar, for puzzles. */
export function CountdownBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  const low = remaining <= 10_000;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded bg-panel-soft">
        <div
          className={`h-full transition-[width] duration-100 ${low ? 'bg-tag-blunder' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`w-12 text-right font-mono text-sm font-bold tabular-nums ${
          low ? 'text-tag-blunder' : 'text-ink-soft'
        }`}
      >
        {formatClock(remaining)}
      </span>
    </div>
  );
}
