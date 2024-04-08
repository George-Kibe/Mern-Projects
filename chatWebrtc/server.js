const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})


io.on('connection', (socket) => {
    console.log(`User Connected ID: ${socket.id}`);
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        socket.broadcast.emit("callEnded")
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('callUser', { signal: data.signalData, from: data.from, name: data.name });
    })

    socket.on("answerCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal) 
    })
})

server.listen(8000, () => {
    console.log("Server running on port 8000");
});