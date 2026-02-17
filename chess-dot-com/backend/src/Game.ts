import { Chess } from "chess.js";
import type WebSocket from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages.js";

export class Game{
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    //public moves: string[];
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess() // "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        // this.moves = [];
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                "message": "Game has started",
                "You will be playing as": "white",
                "color": "white"
            }
        }))
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                "message": "Game has started",
                "You will be playing as": "black",
                "color": "black"
            }
        }))
    }

    makeMove(socket: WebSocket, move: {
        from: string,
        to: string
    }){
        // validate the move type using zod
        if (this.board.turn() === "w" && socket !== this.player1){
            return;
        }
        if (this.board.turn() === "b" && socket !== this.player2){
            return;
        }
        // is it this users move?
        // update the board
        // save the move
        try {
            console.log("Move: ", move)
            const result = this.board.move(move);
            if (!result) return; // illegal move protection
            // send move to the opponent
            console.log("Move Result: ", result)
            if (result.color === 'w') {
                // white moved → notify black player
                this.player2.send(JSON.stringify({
                    type: MOVE,
                    payload: result
                }));
            } else {
                // black moved → notify white player
                this.player1.send(JSON.stringify({
                    type: MOVE,
                    payload: result
                }));
            }
        } catch (error) {
            console.log(error)
        }
        // send the updated board to both players
        // check for game end conditions
        if (this.board.isGameOver()){
            // send the game over message to both players
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.isCheckmate() ? (this.board.turn() === 'w' ? 'black' : 'white') : 'draw'
                }
            }))
            return;
        }
        // send updated board to both players
    }
}