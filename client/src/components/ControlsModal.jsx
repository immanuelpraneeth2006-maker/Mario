import React from 'react';
import { X, Gamepad2, ShieldAlert, Zap, Flame, Award } from 'lucide-react';

export function ControlsModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="glass-panel p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto border border-white/20 shadow-2xl flex flex-col gap-5 text-white">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-yellow-400" size={22} />
            <h2 className="font-retro text-sm text-yellow-400">HOW TO PLAY & CONTROLS</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Controls Table */}
        <div>
          <h3 className="text-xs font-bold text-zinc-300 mb-2 font-retro">KEYBOARD CONTROLS</h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex justify-between items-center">
              <span className="text-zinc-400">Move Left / Right:</span>
              <kbd className="bg-black/60 px-2 py-1 rounded text-[11px] font-mono border border-white/10">A / D or ← / →</kbd>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex justify-between items-center">
              <span className="text-zinc-400">Jump / Double-Jump:</span>
              <kbd className="bg-black/60 px-2 py-1 rounded text-[11px] font-mono border border-white/10">SPACE / W / ↑</kbd>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex justify-between items-center">
              <span className="text-zinc-400">Sprint Boost:</span>
              <kbd className="bg-black/60 px-2 py-1 rounded text-[11px] font-mono border border-white/10">SHIFT</kbd>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex justify-between items-center">
              <span className="text-zinc-400">Fireball (When Powered):</span>
              <kbd className="bg-black/60 px-2 py-1 rounded text-[11px] font-mono border border-white/10">X or J</kbd>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex justify-between items-center col-span-2">
              <span className="text-zinc-400">Pause Game:</span>
              <kbd className="bg-black/60 px-2 py-1 rounded text-[11px] font-mono border border-white/10">ESC or P</kbd>
            </div>
          </div>
        </div>

        {/* Survival Rules */}
        <div>
          <h3 className="text-xs font-bold text-amber-400 mb-2 font-retro">SURVIVAL MECHANICS</h3>
          <div className="flex flex-col gap-2.5 text-xs text-zinc-300 font-sans">
            <div className="flex items-start gap-2.5 bg-red-950/30 p-2.5 rounded-lg border border-red-800/30">
              <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-300">Health (HP):</strong> You have 3 Hearts. Touching enemies or spikes costs 1 HP. Falling into pits is instant defeat!
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/30">
              <Zap size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Stamina (0% = GAME OVER!):</strong> Running and double-jumping drains stamina. <strong className="text-red-400">Bumping your head into rock blocks drains -8% stamina!</strong> (Only <span className="text-yellow-400 font-bold">?</span> mystery blocks are safe). If stamina drops to 0%, Mario collapses immediately! Collect <span className="text-cyan-300 font-bold">Energy Bars</span> and <span className="text-red-300 font-bold">Mushrooms</span> to stay alive.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-yellow-950/30 p-2.5 rounded-lg border border-yellow-800/30">
              <Award size={18} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-yellow-300">Coins & Wardrobe:</strong> Collect floating coin clusters across 3 levels to buy unique characters & costumes (Cyber Runner, Shadow Shinobi, Golden Champion) in the Wardrobe Shop!
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/30">
              <Award size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">3 Epic Levels:</strong> Clear Level 1 (Verdant Plains) to advance to Level 2 (Crystal Caverns) and Level 3 (Sky Citadel) for the Grand Victory!
              </div>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="btn-arcade btn-primary mt-2">
          GOT IT, LET'S PLAY!
        </button>
      </div>
    </div>
  );
}

export default ControlsModal;
