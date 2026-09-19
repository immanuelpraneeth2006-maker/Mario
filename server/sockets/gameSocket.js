/**
 * Socket.IO Real-time Game Networking & Room Synchronization
 */

const setupGameSocket = (io) => {
  // Store active rooms: roomId -> { id, name, host, players: { socketId: playerState } }
  const rooms = new Map();

  // Helper to get public room summary
  const getRoomSummaries = () => {
    const list = [];
    rooms.forEach((room, id) => {
      list.push({
        id,
        name: room.name,
        playerCount: Object.keys(room.players).length,
        maxPlayers: 4,
        levelId: room.levelId || 1
      });
    });
    return list;
  };

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection: ${socket.id}`);
    let currentRoomId = null;

    // Send available room list on connect
    socket.emit('roomsList', getRoomSummaries());

    // Join or create room
    socket.on('joinRoom', ({ roomId = 'lobby_1', roomName, username = 'Player', color = '#ef4444', levelId = 1 }) => {
      // Leave previous room if any
      if (currentRoomId && rooms.has(currentRoomId)) {
        socket.leave(currentRoomId);
        const prevRoom = rooms.get(currentRoomId);
        delete prevRoom.players[socket.id];
        socket.to(currentRoomId).emit('playerLeft', { id: socket.id, username });
        if (Object.keys(prevRoom.players).length === 0) {
          rooms.delete(currentRoomId);
        }
      }

      currentRoomId = roomId;
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          name: roomName || `Room ${roomId}`,
          host: socket.id,
          levelId: Number(levelId),
          players: {}
        });
      }

      const room = rooms.get(roomId);
      const playerObj = {
        id: socket.id,
        username,
        color,
        x: 64,
        y: 400,
        vx: 0,
        vy: 0,
        facing: 'right',
        animState: 'idle',
        health: 3,
        hunger: 100,
        score: 0,
        isGrounded: true
      };

      room.players[socket.id] = playerObj;

      // Notify joining player with current room state & other players
      socket.emit('joinedRoomSuccess', {
        roomId,
        yourId: socket.id,
        players: room.players,
        levelId: room.levelId
      });

      // Broadcast to other players in the room that a new player arrived
      socket.to(roomId).emit('playerJoined', playerObj);

      // Update room list for all lobby clients
      io.emit('roomsList', getRoomSummaries());
      console.log(`[Socket.IO] Player ${username} (${socket.id}) joined room ${roomId}`);
    });

    // Player position / movement update
    socket.on('playerMove', (data) => {
      if (!currentRoomId || !rooms.has(currentRoomId)) return;
      const room = rooms.get(currentRoomId);
      if (room.players[socket.id]) {
        Object.assign(room.players[socket.id], data);
        // Relay position to other players in the room
        socket.to(currentRoomId).emit('playerMoved', {
          id: socket.id,
          ...data
        });
      }
    });

    // Player action (fireball shot, stomp, power-up picked up, emote)
    socket.on('playerAction', (action) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('remoteAction', {
        id: socket.id,
        ...action
      });
    });

    // In-room chat
    socket.on('chatMessage', (msg) => {
      if (!currentRoomId || !rooms.has(currentRoomId)) return;
      const room = rooms.get(currentRoomId);
      const sender = room.players[socket.id]?.username || 'Player';
      io.in(currentRoomId).emit('chatMessage', {
        id: 'msg_' + Date.now(),
        sender,
        text: String(msg.text || '').slice(0, 150),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId);
        const username = room.players[socket.id]?.username || 'Player';
        delete room.players[socket.id];
        socket.to(currentRoomId).emit('playerLeft', { id: socket.id, username });

        if (Object.keys(room.players).length === 0) {
          rooms.delete(currentRoomId);
        }
        io.emit('roomsList', getRoomSummaries());
      }
    });
  });
};

module.exports = setupGameSocket;
