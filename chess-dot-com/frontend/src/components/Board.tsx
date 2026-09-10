import { useCallback, useMemo, useRef, useState } from 'react';
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const PROMOTION_CHOICES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

export type BoardArrow = {
  from: Square;
  to: Square;
  /** Any CSS colour. Defaults to the accent green. */
  color?: string;
  /** Rank badge drawn on the destination square, e.g. "1" for the best move. */
  label?: string;
};

export type BoardProps = {
  fen: string;
  orientation: Color;
  /** Return true if the move was accepted; the board resets its selection either way. */
  onMove?: (move: { from: Square; to: Square; promotion?: string }) => boolean | void;
  interactive?: boolean;
  /** Highlighted as the move that was just played. */
  lastMove?: { from: Square; to: Square } | null;
  arrows?: BoardArrow[];
};

/** Grid coordinates for a square, accounting for board orientation. */
function squareToXY(square: Square, orientation: Color): { col: number; row: number } {
  const file = square.charCodeAt(0) - 97; // a=0
  const rank = Number(square[1]) - 1; // 1=0
  return orientation === 'w'
    ? { col: file, row: 7 - rank }
    : { col: 7 - file, row: rank };
}

function xyToSquare(col: number, row: number, orientation: Color): Square {
  const file = orientation === 'w' ? col : 7 - col;
  const rank = orientation === 'w' ? 7 - row : row;
  return `${FILES[file]}${rank + 1}` as Square;
}

export function Board({
  fen,
  orientation,
  onMove,
  interactive = false,
  lastMove = null,
  arrows = [],
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<Square | null>(null);
  const [drag, setDrag] = useState<{ from: Square; x: number; y: number; size: number } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const chess = useMemo(() => {
    const c = new Chess();
    try {
      c.load(fen);
    } catch {
      /* keep the starting position rather than crashing on a malformed FEN */
    }
    return c;
  }, [fen]);

  const board = chess.board();

  // Clear any stale selection when the position changes underneath us. Adjusting
  // state during render is the supported way to react to a changed prop —
  // doing it in an effect would render the old selection first.
  const [renderedFen, setRenderedFen] = useState(fen);
  if (renderedFen !== fen) {
    setRenderedFen(fen);
    setSelected(null);
    setDrag(null);
  }

  const legalTargets = useMemo(() => {
    if (!selected || !interactive) return new Map<Square, boolean>();
    const map = new Map<Square, boolean>();
    for (const mv of chess.moves({ square: selected, verbose: true })) {
      map.set(mv.to as Square, Boolean(mv.captured));
    }
    return map;
  }, [chess, selected, interactive]);

  const checkedKingSquare = useMemo(() => {
    if (!chess.isCheck()) return null;
    const turn = chess.turn();
    for (const row of chess.board()) {
      for (const sq of row) {
        if (sq && sq.type === 'k' && sq.color === turn) return sq.square;
      }
    }
    return null;
  }, [chess]);

  const isPromotion = useCallback(
    (from: Square, to: Square) =>
      chess
        .moves({ square: from, verbose: true })
        .some((mv) => mv.to === to && Boolean(mv.promotion)),
    [chess],
  );

  const attemptMove = useCallback(
    (from: Square, to: Square) => {
      if (!onMove) return;
      if (isPromotion(from, to)) {
        setPendingPromotion({ from, to });
        return;
      }
      onMove({ from, to });
      setSelected(null);
    },
    [onMove, isPromotion],
  );

  const squareFromPointer = useCallback(
    (clientX: number, clientY: number): Square | null => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const col = Math.floor(((clientX - rect.left) / rect.width) * 8);
      const row = Math.floor(((clientY - rect.top) / rect.height) * 8);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;
      return xyToSquare(col, row, orientation);
    },
    [orientation],
  );

  function onPointerDown(e: React.PointerEvent, square: Square) {
    if (!interactive) return;

    const piece = chess.get(square);
    const isOwnPiece = piece && piece.color === chess.turn();

    // Second click on a legal destination completes the move.
    if (selected && legalTargets.has(square)) {
      attemptMove(selected, square);
      return;
    }

    if (!isOwnPiece) {
      setSelected(null);
      return;
    }

    setSelected(square);
    // Capture the square size now; reading layout during render is not allowed.
    const size = (boardRef.current?.getBoundingClientRect().width ?? 480) / 8;
    setDrag({ from: square, x: e.clientX, y: e.clientY, size });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!drag) return;
    const target = squareFromPointer(e.clientX, e.clientY);
    const from = drag.from;
    setDrag(null);

    // A pointer-up on the origin square is a click, not a drag: keep it selected.
    if (!target || target === from) return;
    if (legalTargets.has(target)) attemptMove(from, target);
  }

  const draggingPiece = drag ? chess.get(drag.from) : null;

  return (
    <div className="relative w-full max-w-[min(78vh,620px)] select-none">
      <div
        ref={boardRef}
        className="relative grid aspect-square w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-md shadow-lg"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
      >
        {board.flatMap((row, rowIdx) =>
          row.map((piece, colIdx) => {
            // chess.board() is always white-first; flip for a black-side view.
            const displayRow = orientation === 'w' ? rowIdx : 7 - rowIdx;
            const displayCol = orientation === 'w' ? colIdx : 7 - colIdx;
            const square = xyToSquare(displayCol, displayRow, orientation);

            const dark = (displayRow + displayCol) % 2 === 1;
            const isTarget = legalTargets.has(square);
            const isCapture = legalTargets.get(square) === true;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isChecked = checkedKingSquare === square;
            const isDragSource = drag?.from === square;

            return (
              <div
                key={square}
                onPointerDown={(e) => onPointerDown(e, square)}
                style={{ gridColumn: displayCol + 1, gridRow: displayRow + 1 }}
                className={[
                  'relative flex items-center justify-center',
                  dark ? 'bg-board-dark' : 'bg-board-light',
                  interactive ? 'cursor-pointer' : '',
                ].join(' ')}
              >
                {isLastMove ? <div className="absolute inset-0 bg-board-move/45" /> : null}
                {isChecked ? (
                  <div className="absolute inset-0 bg-board-check/55" />
                ) : null}
                {selected === square ? <div className="absolute inset-0 bg-board-move/60" /> : null}

                {/* File and rank labels, on the edges only. */}
                {displayCol === 0 ? (
                  <span
                    className={`pointer-events-none absolute left-0.5 top-0.5 text-[9px] font-bold ${
                      dark ? 'text-board-light/80' : 'text-board-dark/80'
                    }`}
                  >
                    {square[1]}
                  </span>
                ) : null}
                {displayRow === 7 ? (
                  <span
                    className={`pointer-events-none absolute bottom-0.5 right-0.5 text-[9px] font-bold ${
                      dark ? 'text-board-light/80' : 'text-board-dark/80'
                    }`}
                  >
                    {square[0]}
                  </span>
                ) : null}

                {piece && !isDragSource ? (
                  <img
                    src={`/${piece.color}${piece.type}.png`}
                    alt={`${piece.color}${piece.type}`}
                    draggable={false}
                    className="pointer-events-none relative h-full w-full object-contain"
                  />
                ) : null}

                {/* Legal-move hints: a dot for a quiet move, a ring for a capture. */}
                {isTarget && !isCapture ? (
                  <div className="pointer-events-none absolute h-[30%] w-[30%] rounded-full bg-black/25" />
                ) : null}
                {isTarget && isCapture ? (
                  <div className="pointer-events-none absolute inset-[6%] rounded-full border-[6px] border-black/25" />
                ) : null}
              </div>
            );
          }),
        )}

        {/* Engine suggestion arrows, drawn in board-square units. */}
        {arrows.length > 0 ? (
          <svg viewBox="0 0 8 8" className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              {arrows.map((a, i) => (
                <marker
                  key={i}
                  id={`arrowhead-${i}`}
                  markerWidth="3"
                  markerHeight="3"
                  refX="1.6"
                  refY="1.5"
                  orient="auto"
                >
                  <polygon points="0,0 3,1.5 0,3" fill={a.color ?? 'var(--color-accent)'} />
                </marker>
              ))}
            </defs>
            {arrows.map((a, i) => {
              const from = squareToXY(a.from, orientation);
              const to = squareToXY(a.to, orientation);
              return (
                <line
                  key={`line-${i}`}
                  x1={from.col + 0.5}
                  y1={from.row + 0.5}
                  x2={to.col + 0.5}
                  y2={to.row + 0.5}
                  stroke={a.color ?? 'var(--color-accent)'}
                  strokeWidth={0.16}
                  strokeLinecap="round"
                  opacity={0.9}
                  markerEnd={`url(#arrowhead-${i})`}
                />
              );
            })}

            {/* Rank badges, drawn after the lines so they stay readable. */}
            {arrows.map((a, i) =>
              a.label ? (
                <g key={`badge-${i}`}>
                  <circle
                    cx={squareToXY(a.to, orientation).col + 0.8}
                    cy={squareToXY(a.to, orientation).row + 0.2}
                    r={0.26}
                    fill={a.color ?? 'var(--color-accent)'}
                    stroke="#ffffff"
                    strokeWidth={0.05}
                  />
                  <text
                    x={squareToXY(a.to, orientation).col + 0.8}
                    y={squareToXY(a.to, orientation).row + 0.2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={0.34}
                    fontWeight="800"
                    fill="#0d1b06"
                  >
                    {a.label}
                  </text>
                </g>
              ) : null,
            )}
          </svg>
        ) : null}
      </div>

      {/* The piece being dragged follows the pointer above everything else. */}
      {drag && draggingPiece ? (
        <img
          src={`/${draggingPiece.color}${draggingPiece.type}.png`}
          alt=""
          draggable={false}
          style={{
            left: drag.x,
            top: drag.y,
            width: drag.size,
          }}
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
        />
      ) : null}

      {pendingPromotion ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="rounded-lg bg-panel p-4">
            <div className="mb-3 text-center text-sm text-ink-soft">Promote to</div>
            <div className="flex gap-2">
              {PROMOTION_CHOICES.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onMove?.({ ...pendingPromotion, promotion: p });
                    setPendingPromotion(null);
                    setSelected(null);
                  }}
                  className="h-16 w-16 rounded bg-panel-soft p-1 hover:bg-accent/30"
                >
                  <img src={`/${chess.turn()}${p}.png`} alt={p} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
