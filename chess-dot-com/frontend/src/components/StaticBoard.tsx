import type { Color, PieceSymbol, Square } from 'chess.js';

type BoardMatrix = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)[][];

export function StaticBoard({ board }: { board: BoardMatrix }) {
  return (
    <div className="w-full max-w-[560px] aspect-square">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {board.flatMap((row, i) =>
          row.map((sq, j) => {
            const dark = (i + j) % 2 === 1;
            return (
              <div
                key={`${i}-${j}`}
                className={`flex items-center justify-center select-none ${
                  dark ? 'bg-green-700' : 'bg-green-100'
                }`}
              >
                {sq ? (
                  <img
                    className="w-full h-full object-contain"
                    src={`/${sq.color}${sq.type}.png`}
                    alt={`${sq.color}${sq.type}`}
                    draggable={false}
                  />
                ) : null}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
