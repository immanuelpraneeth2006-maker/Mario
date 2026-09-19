import React, { useState } from 'react';
import { Users, Plus, X, Globe, Radio, Play } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export function LobbyModal({ onClose, onStartGame }) {
  const { rooms, connected, currentRoom, joinRoom } = useSocket();
  const { user } = useAuth();
  const [roomNameInput, setRoomNameInput] = useState('');

  const playerName = user?.username || `Player_${Math.floor(Math.random() * 900 + 100)}`;

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const id = 'room_' + Math.random().toString(36).substring(2, 8);
    joinRoom({
      roomId: id,
      roomName: roomNameInput.trim() || `${playerName}'s Squad`,
      username: playerName,
      color: '#ef4444',
      levelId: 1
    });
    setRoomNameInput('');
  };

  const handleJoin = (roomId, roomName) => {
    joinRoom({
      roomId,
      roomName,
      username: playerName,
      color: '#3b82f6',
      levelId: 1
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-6 max-w-lg w-full border border-white/20 shadow-2xl flex flex-col gap-5 text-white font-sans">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Users className="text-blue-400" size={24} />
            <h2 className="font-retro text-sm text-blue-400">MULTIPLAYER CO-OP LOBBY</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Server Status Banner */}
        <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <Radio size={14} className={connected ? 'text-green-400 animate-pulse' : 'text-red-400'} />
            <span className="text-zinc-300">
              Server: {connected ? <strong className="text-green-400">LIVE (WebSocket Connected)</strong> : <span className="text-red-400">OFFLINE (Single-Player Mode Only)</span>}
            </span>
          </div>
          <span className="text-zinc-400 font-retro text-[10px]">YOU: {playerName}</span>
        </div>

        {/* Current Active Room State */}
        {currentRoom ? (
          <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-500/40 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-retro text-xs text-blue-300">ROOM: {currentRoom.roomId}</span>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Ready to Play</span>
            </div>
            <div className="text-xs text-zinc-300">
              Other players in your room will appear as live co-op allies in World 1-1!
            </div>
            <button
              onClick={() => onStartGame(true)}
              className="btn-arcade btn-primary py-3 flex items-center justify-center gap-2 mt-2"
            >
              <Play size={16} /> LAUNCH CO-OP GAME NOW
            </button>
          </div>
        ) : (
          <>
            {/* Create Room Form */}
            <form onSubmit={handleCreateRoom} className="flex gap-2">
              <input
                type="text"
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                placeholder="Enter Room Name..."
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!connected}
                className="btn-arcade btn-blue px-4 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} /> CREATE ROOM
              </button>
            </form>

            {/* Room List */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              <h3 className="text-xs font-bold text-zinc-400 font-retro">AVAILABLE SQUADS</h3>
              {rooms.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs bg-white/5 rounded-xl border border-white/5">
                  No public rooms found. Create one above to invite friends!
                </div>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-zinc-100">{room.name}</span>
                      <span className="text-[11px] text-zinc-400">
                        Level: World 1-{room.levelId} • Players: {room.playerCount}/{room.maxPlayers}
                      </span>
                    </div>

                    <button
                      onClick={() => handleJoin(room.id, room.name)}
                      disabled={!connected || room.playerCount >= room.maxPlayers}
                      className="btn-arcade btn-gold text-[10px] px-3 py-1.5 disabled:opacity-40"
                    >
                      JOIN ROOM
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <button onClick={onClose} className="btn-arcade btn-secondary mt-1">
          BACK TO MENU
        </button>
      </div>
    </div>
  );
}

export default LobbyModal;
