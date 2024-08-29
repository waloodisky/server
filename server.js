const express = require('express');

const http = require('http');

const socketIO = require('socket.io');

const app = express();

const server = http.createServer(app);

const io = socketIO(server);

const waitingPlayers = [];


// Handle WebSocket connections

io.on('connection', (socket) => {

    console.log('A user connected');

    waitingPlayers.push(socket);

    console.log(`Player added to queue. Queue length: ${waitingPlayers.length}`);

    if (waitingPlayers.length >= 2) {

        const player1 = waitingPlayers.shift();

        const player2 = waitingPlayers.shift();

        const roomId = Math.random().toString(36).substring(2, 9);

        player1.join(roomId);

        player2.join(roomId);

        player1.emit('roomCreated', roomId);

        player2.emit('roomCreated', roomId);

        io.to(roomId).emit('gameStart');

    }

    socket.on('click', (roomId) => {

        io.to(roomId).emit('updateClick', socket.id);

    });

    socket.on('disconnect', () => {

        console.log('A user disconnected');

        const index = waitingPlayers.indexOf(socket);

        if (index !== -1) {

            waitingPlayers.splice(index, 1);

        }

        io.emit('playerDisconnected', socket.id);

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);

});