import React, { useState, useEffect } from 'react';
import { Trophy, X, Medal, Clock, Award } from 'lucide-react';

export function Leaderboard({ onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=10');
        const data = await res.json();
        if (data.success) {
          setScores(data.scores);
        }
      } catch (err) {
        console.warn('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-6 max-w-lg w-full border border-white/20 shadow-2xl flex flex-col gap-4 text-white font-sans">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400" size={24} />
            <h2 className="font-retro text-sm text-yellow-400">HALL OF FAME (TOP 10)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-400 font-retro text-xs animate-pulse">
            LOADING RANKINGS...
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {scores.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">
                No scores recorded yet. Clear Level 1 to claim the #1 spot!
              </div>
            ) : (
              scores.map((entry, index) => {
                const rank = index + 1;
                let rankBadge = `${rank}`;
                let rankColor = 'text-zinc-400';
                if (rank === 1) {
                  rankColor = 'text-yellow-400 font-bold';
                  rankBadge = '🥇 1';
                } else if (rank === 2) {
                  rankColor = 'text-slate-300 font-bold';
                  rankBadge = '🥈 2';
                } else if (rank === 3) {
                  rankColor = 'text-amber-600 font-bold';
                  rankBadge = '🥉 3';
                }

                return (
                  <div
                    key={entry._id || index}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      rank === 1
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-12 text-xs font-retro ${rankColor}`}>{rankBadge}</span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-zinc-100">{entry.username}</span>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {entry.timeElapsed || 0}s
                          </span>
                          <span>•</span>
                          <span>World 1-{entry.levelId || 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-retro text-xs text-yellow-400 font-bold">
                        {entry.score.toLocaleString()} PTS
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <button onClick={onClose} className="btn-arcade btn-secondary mt-2">
          CLOSE
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;
