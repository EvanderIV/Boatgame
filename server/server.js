const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Store active rooms and their hosts
const activeRooms = new Map();

io.on('connection', client => {
    let roomCode = null;
    let lastPing = Date.now();
    let pingInterval;
    
    client.on('create-room', (data) => {
        roomCode = data.roomCode;
        console.log(`Creating room with code: ${roomCode}`);
        if (activeRooms.has(roomCode)) {
            client.emit('roomError', { message: 'Room already exists' });
            return;
        }
        activeRooms.set(roomCode, {
            hostId: client.id,
            hostSkin: data.hostSkin,
            players: new Map()
        });
        client.join(roomCode);
        client.emit('roomCreated', { roomCode });
        console.log(`Host created room: ${roomCode}`);
    });

    client.on('join-room', (data) => {
        roomCode = data.roomCode;
        console.log(`Join room attempt: ${roomCode}`);
        const playerData = {
            name: data.name,
            skinId: data.skinId
        };

        if (!activeRooms.has(roomCode)) {
            client.emit('roomError', { message: 'Room does not exist' });
            return;
        }

        const room = activeRooms.get(roomCode);
        if (room.players.size >= 4) {
            client.emit('roomError', { message: 'Room is full' });
            return;
        }

        // Check if this client is already in the room
        if (room.players.has(client.id)) {
            console.log(`Client ${client.id} already in room ${roomCode}`);
            client.emit('joinSuccess', { 
                roomCode,
                hostSkin: room.hostSkin
            });
            return;
        }

        room.players.set(client.id, playerData);
        client.join(roomCode);
        client.emit('joinSuccess', { 
            roomCode,
            hostSkin: room.hostSkin
        });
        io.to(room.hostId).emit('playerJoined', playerData);
        console.log(`Player ${data.name} joined room: ${roomCode}`);
    });

    client.on('ping', () => {
        client.emit('pong');
        lastPing = Date.now();
    });

    const handleDisconnect = () => {
        if (roomCode) {
            const room = activeRooms.get(roomCode);
            if (room) {
                if (client.id === room.hostId) {
                    // Host disconnected, notify all players and close room
                    io.to(roomCode).emit('roomClosed');
                    activeRooms.delete(roomCode);
                } else {
                    // Player disconnected, notify host
                    const playerData = room.players.get(client.id);
                    if (playerData) {
                        io.to(room.hostId).emit('playerLeft', { name: playerData.name });
                        room.players.delete(client.id);
                    }
                }
                // Leave the room
                client.leave(roomCode);
            }
        }
        
        // Clean up ping interval
        if (pingInterval) {
            clearInterval(pingInterval);
        }
    };

    client.on('disconnect', handleDisconnect);
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
