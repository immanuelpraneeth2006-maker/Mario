import React, { useEffect, useState } from 'react';
import { Award, RotateCcw, Home, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function VictoryModal({ stats, onRetry, onExitToMenu }) {
  const { user } = useAuth();
  const {
    score = 0,
    coins = 0,
    timeElapsed = 0,
    timeBonus = 0,
    hungerBonus = 0,
    levelId = 1
  } = stats || {};

  const [submitted, setSubmitted] = useState(false);
  const playerName = user?.username || 'GuestHero';

  useEffect(() => {
    // Automatically submit score to backend leaderboard
    const submit = async () => {
      try {
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?._id || user?.id || null,
            username: playerName,
            score,
            timeElapsed,
            coinsCollected: coins,
            levelId
          })
        });
        setSubmitted(true);
      } catch (err) {
        console.warn('Score submission error:', err);
      }
    };
    submit();
  }, [score, timeElapsed, coins, levelId, playerName, user]);

  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-8 max-w-md w-full border border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.3)] flex flex-col items-center gap-5 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
          <Award size={36} />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-retro mb-1">
            <Sparkles size={14} /> COURSE COMPLETED! <Sparkles size={14} />
          </div>
          <h2 className="font-retro text-2xl text-yellow-400 tracking-wider drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
            VICTORY!
          </h2>
          <p className="text-xs text-zinc-300 mt-1 font-sans">
            Heroic survival! You conquered the perils of World 1-{levelId}.
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="w-full bg-black/60 p-4 rounded-xl border border-white/10 flex flex-col gap-2 font-retro text-xs text-left">
          <div className="flex justify-between text-zinc-400">
            <span>COINS BONUS:</span>
            <span className="text-amber-400">+{coins * 200}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>TIME BONUS:</span>
            <span className="text-cyan-400">+{timeBonus}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>ENERGY BONUS:</span>
            <span className="text-emerald-400">+{hungerBonus}</span>
          </div>
          <div className="h-px bg-white/10 my-1" />
          <div className="flex justify-between text-sm">
            <span className="text-white">TOTAL SCORE:</span>
            <span className="text-yellow-400 font-bold text-base drop-shadow-[0_0_8px_#f59e0b]">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-sans">
            <CheckCircle size={14} />
            <span>Score posted to Global Leaderboard!</span>
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 font-retro text-xs mt-1">
          <button onClick={onRetry} className="btn-arcade btn-primary py-3 flex items-center justify-center gap-2">
            <RotateCcw size={16} /> PLAY AGAIN
          </button>
          <button onClick={onExitToMenu} className="btn-arcade btn-secondary py-3 flex items-center justify-center gap-2">
            <Home size={16} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

export default VictoryModal;
