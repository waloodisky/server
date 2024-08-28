const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('joinGame', () => {
        let roomId = findAvailableRoom();
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = { player1: socket.id, player2: null, player1Score: 0, player2Score: 0 };
        } else if (!rooms[roomId].player2) {
            rooms[roomId].player2 = socket.id;
            io.to(roomId).emit('startGame', roomId);
        }

        socket.on('click', () => {
            if (rooms[roomId].player1 === socket.id) {
                rooms[roomId].player1Score++;
            } else if (rooms[roomId].player2 === socket.id) {
                rooms[roomId].player2Score++;
            }

            io.to(roomId).emit('updateScores', {
                player1Score: rooms[roomId].player1Score,
                player2Score: rooms[roomId].player2Score
            });
        });

        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id);
            if (rooms[roomId]) {
                delete rooms[roomId];
                io.to(roomId).emit('endGame');
            }
        });
    });
});

function findAvailableRoom() {
    for (let roomId in rooms) {
        if (rooms[roomId].player1 && !rooms[roomId].player2) {
            return roomId;
        }
    }
    return 'room-' + Math.floor(Math.random() * 10000);
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
