import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import ChessBoard from '../components/ChessBoard';
import { Button } from '../components/Button';
import { Chess } from 'chess.js';

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      // console.log(event);
      const message = JSON.parse(event.data);
      switch (message.type){
        case INIT_GAME:
          setChess(new Chess());
          setBoard(chess.board());
          console.log("Game initialized", message.payload);
          break;
        case MOVE:
          console.log("Move made", message);
          const move = message.move;
          chess.load(message.payload.after);  // ← VERY IMPORTANT
          setBoard(chess.board());  
          //setBoard(chess.board());
          
          break;
        case GAME_OVER:
          console.log("Game over");
          break
      }
    }
  }, [socket])
  
  if (!socket) return <div className="">Connecting...</div>
  return (
    <div className='justify-center'>
      <div className="pt-8 max-w-5xl w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 bg-red-200 w-full flex justify-center">
            <ChessBoard socket={socket} board={board} />
          </div>
          <div className="rounded-md pt-2 bg-bgAuxiliary3 flex-1 overflow-auto h-[95vh] overflow-y-scroll no-scrollbar">
            <div className="pt-8 flex justify-center w-full">
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
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Game