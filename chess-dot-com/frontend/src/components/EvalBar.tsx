import { cpToWinProbability, formatCp } from '../lib/analysis/score';

/** Vertical evaluation bar: White fills from the bottom. */
export function EvalBar({ cp, height }: { cp: number | null; height?: string }) {
  const whiteShare = cpToWinProbability(cp) * 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative w-5 overflow-hidden rounded bg-[#403d39] ${height ?? 'h-[min(78vh,620px)]'}`}
        title={formatCp(cp)}
      >
        <div
          className="absolute bottom-0 w-full bg-[#f0f0f0] transition-[height] duration-300"
          style={{ height: `${whiteShare}%` }}
        />
        <div className="absolute top-1/2 h-px w-full bg-black/30" />
      </div>
      <div className="w-12 text-center font-mono text-[11px] text-ink-soft">{formatCp(cp)}</div>
    </div>
  );
}
