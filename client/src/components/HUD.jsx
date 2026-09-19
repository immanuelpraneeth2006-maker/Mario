import React from 'react';
import { Heart, Zap, Volume2, VolumeX, Pause, Flame, Gamepad2 } from 'lucide-react';

export function HUD({
  gameState,
  onPause,
  isMuted,
  onToggleMute,
  showControls,
  onToggleControls
}) {
  const {
    health = 3,
    maxHealth = 3,
    hunger = 100,
    score = 0,
    coins = 0,
    time = 150,
    isFire = false,
    level = 1,
    levelName = 'Verdant Plains'
  } = gameState || {};

  let hungerColor = '#06b6d4'; // Cyan
  let hungerStatus = 'FULL';
  if (hunger < 30) {
    hungerColor = '#ef4444'; // Red
    hungerStatus = 'STARVING!';
  } else if (hunger < 65) {
    hungerColor = '#f59e0b'; // Amber
    hungerStatus = 'HUNGRY';
  }

  return (
    <div className="hud-overlay">
      {/* Top Bar Header */}
      <div className="hud-top-bar">
        {/* Left Column: Health Hearts & Stamina Gauge */}
        <div className="hud-pill-col">
          {/* Health Hearts */}
          <div className="hud-pill">
            <span className="hud-label">HP:</span>
            <div className="hud-hearts-box">
              {Array.from({ length: maxHealth }).map((_, idx) => (
                <Heart
                  key={idx}
                  size={20}
                  style={{
                    fill: idx < health ? '#ef4444' : '#1e293b',
                    color: idx < health ? '#ef4444' : '#475569',
                    filter: idx < health ? 'drop-shadow(0 0 8px #ef4444)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>

            {isFire && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ea580c',
                  border: '1px solid #f97316',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-retro)',
                  color: '#ffffff'
                }}
              >
                <Flame size={12} style={{ fill: '#fef08a', color: '#fef08a' }} />
                <span>FIRE</span>
              </div>
            )}
          </div>

          {/* Stamina Meter */}
          <div className="hud-pill">
            <Zap size={16} style={{ color: hungerColor }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', gap: '8px' }}>
                <span className="hud-label">STAMINA:</span>
                <span style={{ color: hungerColor, fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {hunger}% ({hungerStatus})
                </span>
              </div>
              <div className="stamina-meter-track">
                <div
                  className="stamina-meter-fill"
                  style={{
                    width: `${hunger}%`,
                    backgroundColor: hungerColor,
                    boxShadow: `0 0 10px ${hungerColor}`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: World, Coins, Score */}
        <div className="hud-pill">
          <div style={{ textAlign: 'center' }}>
            <div className="hud-label">WORLD</div>
            <div className="hud-value-lg">1-{level}</div>
            <div style={{ fontSize: '9px', color: '#93c5fd', marginTop: '1px' }}>{levelName}</div>
          </div>

          <div className="hud-divider" />

          {/* Coins */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                border: '1px solid #d97706',
                boxShadow: '0 0 10px #f59e0b'
              }}
            />
            <span style={{ fontFamily: 'var(--font-retro)', fontSize: '12px', color: '#fef08a', fontWeight: 'bold' }}>
              x{String(coins).padStart(2, '0')}
            </span>
          </div>

          <div className="hud-divider" />

          {/* Score */}
          <div style={{ textAlign: 'center' }}>
            <div className="hud-label">SCORE</div>
            <div className="hud-value-gold">{String(score).padStart(6, '0')}</div>
          </div>
        </div>

        {/* Right: Time, Buttons Toggle, Audio, Pause */}
        <div className="hud-actions">
          {/* Time Counter */}
          <div className="hud-pill" style={{ padding: '8px 14px', textAlign: 'center', flexDirection: 'column', gap: '2px' }}>
            <div className="hud-label">TIME</div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '15px',
                fontWeight: '800',
                color: time < 30 ? '#ef4444' : '#ffffff'
              }}
            >
              {String(time).padStart(3, '0')}
            </div>
          </div>

          {/* Buttons Toggle */}
          <button
            onClick={onToggleControls}
            className={`hud-btn ${showControls ? 'is-active' : ''}`}
            title="Toggle On-Screen Virtual Controller"
          >
            <Gamepad2 size={16} />
            <span>Buttons</span>
          </button>

          {/* Audio Mute */}
          <button
            onClick={onToggleMute}
            className="hud-btn"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Pause Game */}
          <button
            onClick={onPause}
            className="hud-btn"
            title="Pause Game (ESC)"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* WASD Ribbon */}
      <div className="wasd-ribbon">
        <span style={{ fontFamily: 'var(--font-retro)', fontSize: '9px', color: '#facc15', fontWeight: 'bold' }}>
          WASD CONTROLS:
        </span>
        <span><kbd className="key-badge">W</kbd> Jump</span>
        <span>•</span>
        <span><kbd className="key-badge">A</kbd> Left</span>
        <span>•</span>
        <span><kbd className="key-badge">S</kbd> Duck</span>
        <span>•</span>
        <span><kbd className="key-badge">D</kbd> Right</span>
        <span>•</span>
        <span><kbd className="key-badge">SHIFT</kbd> Run</span>
        <span>•</span>
        <span><kbd className="key-badge">X</kbd> Fire</span>
      </div>
    </div>
  );
}

export default HUD;
