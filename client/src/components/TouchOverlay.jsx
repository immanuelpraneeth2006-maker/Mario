import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Flame, Zap } from 'lucide-react';

export function TouchOverlay({ onInput, activeInputs = {}, visible = true }) {
  if (!visible) return null;

  const bindButton = (key) => ({
    onMouseDown: (e) => { e.preventDefault(); onInput(key, true); },
    onMouseUp: (e) => { e.preventDefault(); onInput(key, false); },
    onMouseLeave: (e) => { e.preventDefault(); onInput(key, false); },
    onTouchStart: (e) => { e.preventDefault(); onInput(key, true); },
    onTouchEnd: (e) => { e.preventDefault(); onInput(key, false); },
    onTouchCancel: (e) => { e.preventDefault(); onInput(key, false); }
  });

  return (
    <div className="controller-dock">
      {/* Left WASD D-Pad Cluster */}
      <div className="dpad-cluster">
        {/* Left: A */}
        <button
          {...bindButton('left')}
          className={`arcade-key-btn btn-dpad ${activeInputs.left ? 'is-pressed' : ''}`}
          title="Move Left (A / ←)"
        >
          <ArrowLeft size={24} />
          <span className="arcade-key-title">LEFT</span>
          <span className="arcade-key-sub">A / ←</span>
        </button>

        {/* Duck / Crouch: S */}
        <button
          {...bindButton('down')}
          className={`arcade-key-btn btn-dpad ${activeInputs.down ? 'is-pressed' : ''}`}
          title="Duck / Fast Fall (S / ↓)"
        >
          <ArrowDown size={22} style={{ color: '#c084fc' }} />
          <span className="arcade-key-title" style={{ color: '#e9d5ff' }}>DUCK</span>
          <span className="arcade-key-sub" style={{ color: '#c084fc' }}>S / ↓</span>
        </button>

        {/* Right: D */}
        <button
          {...bindButton('right')}
          className={`arcade-key-btn btn-dpad ${activeInputs.right ? 'is-pressed' : ''}`}
          title="Move Right (D / →)"
        >
          <ArrowRight size={24} />
          <span className="arcade-key-title">RIGHT</span>
          <span className="arcade-key-sub">D / →</span>
        </button>
      </div>

      {/* Right Action Cluster: Run, Fire, Jump */}
      <div className="action-cluster">
        {/* Run: Shift */}
        <button
          {...bindButton('sprint')}
          className={`arcade-key-btn btn-action ${activeInputs.sprint ? 'is-pressed' : ''}`}
          title="Sprint Boost (SHIFT)"
        >
          <Zap size={22} style={{ color: '#fde047' }} />
          <span className="arcade-key-title" style={{ color: '#fef08a' }}>RUN</span>
          <span className="arcade-key-sub">SHIFT</span>
        </button>

        {/* Fire: X */}
        <button
          {...bindButton('shoot')}
          className={`arcade-key-btn btn-action ${activeInputs.shoot ? 'is-pressed' : ''}`}
          title="Fireball (X / J)"
        >
          <Flame size={22} style={{ color: '#fb923c' }} />
          <span className="arcade-key-title" style={{ color: '#fed7aa' }}>FIRE</span>
          <span className="arcade-key-sub" style={{ color: '#fb923c' }}>X</span>
        </button>

        {/* Jump: W / Space */}
        <button
          {...bindButton('jump')}
          className={`arcade-key-btn btn-jump ${activeInputs.jump ? 'is-pressed' : ''}`}
          title="Jump / Double-Jump (W / SPACE)"
        >
          <ArrowUp size={36} style={{ color: '#ffffff' }} />
          <span style={{ fontFamily: 'var(--font-retro)', fontSize: '11px', fontWeight: 'bold', marginTop: '3px' }}>
            JUMP
          </span>
          <span className="arcade-key-sub" style={{ color: '#fef08a' }}>W / SPACE</span>
        </button>
      </div>
    </div>
  );
}

export default TouchOverlay;
