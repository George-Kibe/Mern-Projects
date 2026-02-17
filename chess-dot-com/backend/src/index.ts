import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";

const wss = new WebSocketServer({ port: 8000 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    //console.log('connected to webSocket: ', ws)
    ws.on('error', console.error);
    gameManager.addUser(ws);
    // ws.on('message', function message(data) {
    //     console.log('received: %s', data);
    //     // ws.send(data)
    // });
    // ws.send('something');
    ws.on('disconnect', () => {
        gameManager.removeUser(ws)
    })
})