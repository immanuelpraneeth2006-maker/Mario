import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connect to backend Socket.IO
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected to game server:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected from game server');
      setConnected(false);
      setCurrentRoom(null);
    });

    newSocket.on('roomsList', (list) => {
      setRooms(list);
    });

    newSocket.on('joinedRoomSuccess', (roomData) => {
      setCurrentRoom(roomData);
    });

    newSocket.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev.slice(-40), msg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = ({ roomId, roomName, username, color, levelId }) => {
    if (socket && connected) {
      socket.emit('joinRoom', { roomId, roomName, username, color, levelId });
    }
  };

  const sendChatMessage = (text) => {
    if (socket && connected && text.trim()) {
      socket.emit('chatMessage', { text });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        rooms,
        currentRoom,
        messages,
        joinRoom,
        sendChatMessage
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
