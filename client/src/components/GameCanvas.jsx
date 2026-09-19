import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import HUD from './HUD';
import TouchOverlay from './TouchOverlay';
import audioManager from '../game/engine/AudioManager';
import { useSocket } from '../context/SocketContext';

export function GameCanvas({ onGameOver, onVictory, onExitToMenu, onCoinCollected, isMultiplayer = false, costume = 'classic' }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const { socket } = useSocket();

  const [gameState, setGameState] = useState({
    health: 3,
    maxHealth: 3,
    hunger: 100,
    score: 0,
    coins: 0,
    time: 150,
    isFire: false,
    level: 1,
    levelName: 'Verdant Plains'
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [activeInputs, setActiveInputs] = useState({
    left: false,
    right: false,
    jump: false,
    down: false,
    sprint: false,
    shoot: false
  });

  useEffect(() => {
    // Clear any previously inverted storage flag to ensure standard A=Left, D=Right
    localStorage.removeItem('mario_invert_ad');

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize fresh Game Engine
    const engine = new GameEngine(canvas, {
      onHudUpdate: (state) => setGameState(state),
      onGameOver: (stats) => onGameOver(stats),
      onVictory: (stats) => onVictory(stats),
      onCoinCollected: (amount) => {
        if (onCoinCollected) onCoinCollected(amount);
      },
      socketService: isMultiplayer ? socket : null,
      costume: costume || 'classic'
    });

    engineRef.current = engine;
    engine.start();

    // Responsive WASD & Arrow Key Mapping
    const handleKeyDown = (e) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code || '';

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Left: 'A' or ArrowLeft
      if (key === 'a' || code === 'KeyA' || key === 'arrowleft' || code === 'ArrowLeft') {
        engine.input.left = true;
        setActiveInputs((prev) => ({ ...prev, left: true }));
      }
      // Right: 'D' or ArrowRight
      if (key === 'd' || code === 'KeyD' || key === 'arrowright' || code === 'ArrowRight') {
        engine.input.right = true;
        setActiveInputs((prev) => ({ ...prev, right: true }));
      }
      // Jump / Up: 'W', Space, or ArrowUp
      if (key === 'w' || code === 'KeyW' || key === ' ' || code === 'Space' || key === 'arrowup' || code === 'ArrowUp') {
        if (!engine.input.jump) {
          engine.input.jumpJustPressed = true;
        }
        engine.input.jump = true;
        setActiveInputs((prev) => ({ ...prev, jump: true }));
      }
      // Down / Crouch / Fast Fall: 'S' or ArrowDown
      if (key === 's' || code === 'KeyS' || key === 'arrowdown' || code === 'ArrowDown') {
        engine.input.down = true;
        setActiveInputs((prev) => ({ ...prev, down: true }));
      }
      // Fireball: 'X', 'J', or 'F'
      if (key === 'x' || code === 'KeyX' || key === 'j' || code === 'KeyJ' || key === 'f') {
        if (!engine.input.shoot) {
          engine.input.shootJustPressed = true;
        }
        engine.input.shoot = true;
        setActiveInputs((prev) => ({ ...prev, shoot: true }));
      }
      // Sprint: Shift
      if (e.shiftKey || key === 'shift' || code.includes('Shift')) {
        engine.input.sprint = true;
        setActiveInputs((prev) => ({ ...prev, sprint: true }));
      }
      // Pause: Esc or P
      if (key === 'escape' || code === 'Escape' || key === 'p' || code === 'KeyP') {
        togglePause();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code || '';

      // Left: 'A' or ArrowLeft
      if (key === 'a' || code === 'KeyA' || key === 'arrowleft' || code === 'ArrowLeft') {
        engine.input.left = false;
        setActiveInputs((prev) => ({ ...prev, left: false }));
      }
      // Right: 'D' or ArrowRight
      if (key === 'd' || code === 'KeyD' || key === 'arrowright' || code === 'ArrowRight') {
        engine.input.right = false;
        setActiveInputs((prev) => ({ ...prev, right: false }));
      }
      // Jump / Up: 'W', Space, or ArrowUp
      if (key === 'w' || code === 'KeyW' || key === ' ' || code === 'Space' || key === 'arrowup' || code === 'ArrowUp') {
        engine.input.jump = false;
        setActiveInputs((prev) => ({ ...prev, jump: false }));
      }
      // Down / Crouch / Fast Fall: 'S' or ArrowDown
      if (key === 's' || code === 'KeyS' || key === 'arrowdown' || code === 'ArrowDown') {
        engine.input.down = false;
        setActiveInputs((prev) => ({ ...prev, down: false }));
      }
      // Fireball
      if (key === 'x' || code === 'KeyX' || key === 'j' || code === 'KeyJ' || key === 'f') {
        engine.input.shoot = false;
        setActiveInputs((prev) => ({ ...prev, shoot: false }));
      }
      // Sprint
      if (!e.shiftKey || key === 'shift' || code.includes('Shift')) {
        engine.input.sprint = false;
        setActiveInputs((prev) => ({ ...prev, sprint: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.stop();
    };
  }, [isMultiplayer, socket, costume]);

  const togglePause = () => {
    if (!engineRef.current) return;
    const nextState = !engineRef.current.isPaused;
    engineRef.current.isPaused = nextState;
    setIsPaused(nextState);
  };

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleTouchInput = (key, isPressed) => {
    if (!engineRef.current) return;
    if (key === 'jump' && isPressed && !engineRef.current.input.jump) {
      engineRef.current.input.jumpJustPressed = true;
    }
    if (key === 'shoot' && isPressed && !engineRef.current.input.shoot) {
      engineRef.current.input.shootJustPressed = true;
    }
    engineRef.current.input[key] = isPressed;
    setActiveInputs((prev) => ({ ...prev, [key]: isPressed }));
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden select-none">
      {/* High-Clarity HUD Bar */}
      <HUD
        gameState={gameState}
        onPause={togglePause}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        showControls={showControls}
        onToggleControls={() => setShowControls(!showControls)}
      />

      {/* Main Canvas Viewport with Crisp Scaling */}
      <canvas ref={canvasRef} className="game-canvas shadow-2xl" />

      {/* Visible On-Screen WASD Controller Dock */}
      <TouchOverlay
        onInput={handleTouchInput}
        activeInputs={activeInputs}
        visible={showControls}
      />

      {/* Pause Menu Modal */}
      {isPaused && (
        <div className="modal-backdrop">
          <div className="glass-panel p-8 max-w-sm w-full text-center flex flex-col gap-5 border border-white/20 shadow-2xl">
            <h2 className="font-retro text-2xl text-yellow-400 tracking-wider">GAME PAUSED</h2>
            <p className="text-zinc-300 text-xs leading-relaxed font-sans">
              Take a breather! Your hunger drain is paused while this menu is open.
            </p>
            <div className="flex flex-col gap-3 font-retro text-xs mt-2">
              <button onClick={togglePause} className="btn-arcade btn-primary py-3">
                RESUME
              </button>
              <button onClick={onExitToMenu} className="btn-arcade btn-secondary py-3">
                EXIT TO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameCanvas;
