import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import ChessBoard from '../components/ChessBoard';
import { Button } from '../components/Button';
import { Chess } from 'chess.js';

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

const Game = () => {
  const socket = useSocket();

  const [initialChess] = useState(() => new Chess());
  const chessRef = useRef(initialChess);

  const [board, setBoard] = useState(() => initialChess.board());
  const [started, setStarted] = useState(false);
  const [turn, setTurn] = useState(() => initialChess.turn());

  useEffect(() => {
    if (!socket) return;

    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME: {
          chessRef.current = new Chess();
          setBoard(chessRef.current.board());
          setTurn(chessRef.current.turn());
          setStarted(true);
          console.log("Game initialized", message.payload);
          break;
        }
        case MOVE: {
          console.log("Move made", message);
          chessRef.current.load(message.payload.after); // ← VERY IMPORTANT
          setTurn(chessRef.current.turn());
          setBoard(chessRef.current.board());
          break;
        }
        case GAME_OVER: {
          console.log("Game over");
          break;
        }
      }
    };

    socket.addEventListener('message', onMessage);
    return () => {
      socket.removeEventListener('message', onMessage);
    };
  }, [socket]);

  if (!socket) return <div className="">Connecting...</div>;
  return (
    <div className='justify-center'>
      <div className="pt-8 max-w-5xl w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 bg-red-200 w-full flex justify-center">
            <ChessBoard socket={socket} board={board} />
          </div>
          <div className="rounded-md pt-2 bg-bgAuxiliary3 flex-1 overflow-auto h-[95vh] overflow-y-scroll no-scrollbar">
            <div className="pt-8 flex justify-center w-full flex-col">
              {
                //show whose turn it is to play
                <div className="text-2xl font-bold">
                  {turn === 'w' ? "White's turn" : "Black's turn"}
                </div>
              }
              {
                !started && (
                  <Button onClick={() => {
                    socket.send(JSON.stringify({
                      type: INIT_GAME,
                      payload: {
                        userId: "1"
                      }
                    }))
                  }}>
                    Play
                  </Button>
                )
              }
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Game
