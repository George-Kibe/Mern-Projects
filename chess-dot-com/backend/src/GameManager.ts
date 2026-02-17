import type WebSocket from "ws";
import { Game } from "./Game.js";
import { INIT_GAME, MOVE } from "./messages.js";

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket){
        this.users = this.users.filter(user => user !== socket);
    }

    private addHandler(socket: WebSocket){
        socket.on("message", (data) => {
            try {
                console.log(data.toString())
                const message = JSON.parse(data.toString());
                if (message.type === INIT_GAME ){
                    if (this.pendingUser){
                        console.log("Creating a Game")
                        const game = new Game(this.pendingUser, socket);
                        this.games.push(game);
                        this.pendingUser = null;
                    } else {
                        console.log("Adding you to waiting list")
                        this.pendingUser = socket;
                    }
                }
                if (message.type === MOVE ){
                    console.log("Making a move: ", message.payload)
                    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if (game){
                        game.makeMove(socket, message.payload);
                    }
                }
            } catch (err) {
                console.error("Invalid JSON received:", data.toString());
                // optionally send error back to client
                socket.send(JSON.stringify({ type: "ERROR", payload: "Invalid JSON" }));
                return; // stop execution
            }
        })
    }
}