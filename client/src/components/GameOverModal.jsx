import React from 'react';
import { Skull, RotateCcw, Home } from 'lucide-react';

export function GameOverModal({ stats, onRetry, onExitToMenu }) {
  const { score = 0, coins = 0, timeElapsed = 0, deathReason = '' } = stats || {};

  const isExhausted = deathReason === 'exhaustion';

  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-8 max-w-sm w-full border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.3)] flex flex-col items-center gap-5 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 animate-bounce">
          <Skull size={36} />
        </div>

        <div>
          <h2 className="font-retro text-2xl text-red-500 tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
            {isExhausted ? 'OUT OF STAMINA' : 'GAME OVER'}
          </h2>
          <p className="text-xs text-zinc-300 mt-1 font-sans leading-relaxed">
            {isExhausted
              ? 'You collapsed from total stamina exhaustion! Bumping into rock blocks drained your energy. Scavenge food rations to survive!'
              : 'You fell victim to the hazards! Watch out for pitfalls and enemy ambushes.'}
          </p>
        </div>

        {/* Stats Box */}
        <div className="w-full bg-black/60 p-4 rounded-xl border border-white/10 flex flex-col gap-2 font-retro text-xs text-left">
          <div className="flex justify-between text-zinc-400">
            <span>FINAL SCORE:</span>
            <span className="text-yellow-400 font-bold">{score}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>COINS:</span>
            <span className="text-amber-400 font-bold">x{coins}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>SURVIVED:</span>
            <span className="text-cyan-400 font-bold">{timeElapsed}s</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 font-retro text-xs mt-1">
          <button onClick={onRetry} className="btn-arcade btn-primary py-3 flex items-center justify-center gap-2">
            <RotateCcw size={16} /> TRY AGAIN
          </button>
          <button onClick={onExitToMenu} className="btn-arcade btn-secondary py-3 flex items-center justify-center gap-2">
            <Home size={16} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
