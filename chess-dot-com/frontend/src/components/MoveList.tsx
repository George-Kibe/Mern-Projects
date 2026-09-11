import { useEffect, useRef } from 'react';
import type { MoveAnnotation, MoveTag } from '../lib/analysis/classifyMove';

const TAG_COLOR: Record<MoveTag, string> = {
  brilliant: 'text-tag-brilliant',
  best: 'text-tag-best',
  excellent: 'text-tag-excellent',
  good: 'text-ink',
  inaccuracy: 'text-tag-inaccuracy',
  mistake: 'text-tag-mistake',
  blunder: 'text-tag-blunder',
};

const TAG_MARK: Record<MoveTag, string> = {
  brilliant: '!!',
  best: '',
  excellent: '',
  good: '',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
};

export type MoveListProps = {
  sanMoves: string[];
  annotations: MoveAnnotation[];
  /** Position index (0 = start), i.e. one more than the ply of the last move played. */
  currentPly: number;
  onSelectPly: (ply: number) => void;
};

export function MoveList({ sanMoves, annotations, currentPly, onSelectPly }: MoveListProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Scroll this list directly rather than with scrollIntoView: that walks up to
  // the window and drags the whole page, which scrolled the board off screen on
  // every move.
  useEffect(() => {
    const el = activeRef.current;
    const box = scrollRef.current;
    if (!el || !box) return;

    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    const pad = 8;

    if (top < box.scrollTop) {
      box.scrollTop = Math.max(0, top - pad);
    } else if (bottom > box.scrollTop + box.clientHeight) {
      box.scrollTop = bottom - box.clientHeight + pad;
    }
  }, [currentPly]);

  const rows = [];
  for (let i = 0; i < sanMoves.length; i += 2) {
    rows.push({ moveNo: i / 2 + 1, white: i, black: i + 1 });
  }

  if (sanMoves.length === 0) {
    return <div className="p-3 text-sm text-ink-soft">No moves yet.</div>;
  }

  const cell = (idx: number) => {
    if (idx >= sanMoves.length) return <div className="flex-1" />;
    const ann = annotations[idx];
    const tag = ann?.tag;
    const isActive = currentPly === idx + 1;

    return (
      <button
        ref={isActive ? activeRef : null}
        onClick={() => onSelectPly(idx + 1)}
        className={`flex-1 truncate rounded px-2 py-1 text-left font-mono text-sm hover:bg-panel-soft ${
          isActive ? 'bg-accent/25 ring-1 ring-accent/60' : ''
        } ${tag ? TAG_COLOR[tag] : 'text-ink'}`}
        title={ann ? `${ann.tag}${ann.missedChance ? ' · missed chance' : ''}` : undefined}
      >
        {sanMoves[idx]}
        {tag ? TAG_MARK[tag] : ''}
      </button>
    );
  };

  return (
    <div ref={scrollRef} className="flex max-h-[260px] flex-col overflow-y-auto">
      {rows.map((row) => (
        <div key={row.moveNo} className="flex items-center gap-1 px-2 odd:bg-black/10">
          <span className="w-7 shrink-0 text-right font-mono text-xs text-ink-soft">{row.moveNo}.</span>
          {cell(row.white)}
          {cell(row.black)}
        </div>
      ))}
    </div>
  );
}
