import { useMemo } from 'react';
import type { Square } from 'chess.js';
import type { EngineLine } from '../lib/stockfish/engine';
import { describeMove, formatSanLine, pvToSan } from '../lib/chess/describeMove';
import { formatCp, isMateScore, scoreToCp } from '../lib/analysis/score';

/** Must stay in step with ARROW_COLORS in the Analyze panel. */
const BADGE_COLORS = ['var(--color-arrow-1)', 'var(--color-arrow-2)'];

export type AlternativesProps = {
  fen: string;
  lines: EngineLine[];
  /** Ply index of `fen`, used to number the variation correctly. */
  ply: number;
  /** SAN actually played from this position, so it can be marked. */
  playedSan?: string | null;
  onHoverLine?: (move: { from: Square; to: Square } | null) => void;
  onPreviewLine?: (pv: string[]) => void;
};

/**
 * The engine's top candidate moves, each explained in words.
 *
 * The eval says *which* move is better; the explanation says *why*, derived from
 * the board rather than the score, so a move the engine merely tolerates still
 * gets a real reason attached to it.
 */
export function Alternatives({
  fen,
  lines,
  ply,
  playedSan,
  onHoverLine,
  onPreviewLine,
}: AlternativesProps) {
  const items = useMemo(
    () =>
      lines.map((line) => {
        const uci = line.pv[0];
        return {
          line,
          uci,
          insight: uci ? describeMove(fen, uci) : null,
          sanLine: formatSanLine(pvToSan(fen, line.pv, 6), ply),
        };
      }),
    [lines, fen, ply],
  );

  if (items.length === 0) {
    return (
      <div className="p-3 text-sm text-ink-soft">
        Run the analysis to see the engine's candidate moves and why they work.
      </div>
    );
  }

  const bestCp = scoreToCp(items[0]?.line.score ?? null);

  return (
    <div className="flex flex-col divide-y divide-line">
      {items.map(({ line, uci, insight, sanLine }, idx) => {
        if (!insight || !uci) return null;

        const cp = scoreToCp(line.score);

        // Comparing against a mate score would produce a nonsense centipawn gap,
        // so say what is actually being given up instead.
        const missesMate = bestCp !== null && isMateScore(bestCp) && cp !== null && !isMateScore(cp);
        const drop =
          bestCp !== null && cp !== null && !isMateScore(bestCp) && !isMateScore(cp)
            ? Math.abs(bestCp - cp)
            : null;
        const wasPlayed = playedSan != null && insight.san === playedSan;

        return (
          <div
            key={`${uci}-${idx}`}
            onMouseEnter={() =>
              onHoverLine?.({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square })
            }
            onMouseLeave={() => onHoverLine?.(null)}
            className="p-3 transition-colors hover:bg-panel-soft"
          >
            <div className="flex items-baseline gap-2">
              {/* Ranks 1 and 2 are also drawn on the board, in these colours. */}
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black"
                style={{
                  backgroundColor: idx < 2 ? BADGE_COLORS[idx] : 'var(--color-panel-soft)',
                  color: idx < 2 ? '#10240a' : 'var(--color-ink-soft)',
                }}
                title={idx < 2 ? `Engine's move ${idx + 1}, arrowed on the board` : undefined}
              >
                {idx + 1}
              </span>
              <span className="font-mono text-base font-semibold">{insight.san}</span>
              <span className="font-mono text-sm text-ink-soft">{formatCp(cp)}</span>
              {idx > 0 && missesMate ? (
                <span className="text-[11px] text-tag-inaccuracy">misses the mate</span>
              ) : idx > 0 && drop !== null && drop > 5 ? (
                <span className="font-mono text-[11px] text-tag-inaccuracy">
                  −{(drop / 100).toFixed(2)}
                </span>
              ) : null}
              {wasPlayed ? (
                <span className="rounded bg-panel-soft px-1.5 py-0.5 text-[10px] text-ink-soft">
                  you played this
                </span>
              ) : null}
            </div>

            <div className="mt-1.5 text-sm">{insight.headline}</div>

            {insight.facts.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {insight.facts.map((fact, i) => (
                  <li key={i} className="text-xs text-ink-soft">
                    · {fact}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-2 flex items-center gap-2">
              <span className="truncate font-mono text-[11px] text-ink-soft" title={sanLine}>
                {sanLine}
              </span>
              {onPreviewLine ? (
                <button
                  onClick={() => onPreviewLine(line.pv)}
                  className="shrink-0 rounded border border-line px-2 py-0.5 text-[11px] text-ink-soft hover:border-accent hover:text-ink"
                >
                  Play it out
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
