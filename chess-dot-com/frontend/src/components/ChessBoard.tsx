import type { Color, PieceSymbol, Square } from 'chess.js';
import { useState } from 'react';
import { MOVE } from '../screens/Game';

interface ChessBoardProps {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color
  } | null) [] [],
  socket: WebSocket
}
const ChessBoard = ({board, socket}: ChessBoardProps) => {
  const [from, setFrom] = useState<null | Square>(null);
  return (
    <div className='text-white-200'>
      {board.map((row, i) => (
        <div key={i} className='flex'>
          {row.map((square, j) => (
            <div 
              key={j} 
              onClick={() => {
                const squareRepresentation = String.fromCharCode(97 + j) + (8 - i) as Square;

                if (!from){
                  setFrom(squareRepresentation)
                } else {
                  // if (from === squareRepresentation) {
                  //   return;
                  // }
                  console.log("Setting to square", squareRepresentation)
                  const payload = {
                    from,
                    to: squareRepresentation
                  }
                  console.log("Sending move", payload)
                  socket.send(JSON.stringify({
                    type: MOVE,
                    payload
                  }))
                  setFrom(null);
                }
              }}
              className={`w-16 h-16 ${(i + j) % 2 === 0 ? 'bg-green-100' : 'bg-green-700'}`}
            >
              {square ? (
                <img className='w-full h-full' src={`/${square.color}${square.type}.png`} alt={`${square.color} ${square.type}`} />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default ChessBoard