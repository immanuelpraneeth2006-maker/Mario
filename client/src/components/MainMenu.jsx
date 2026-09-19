import React from 'react';
import { Play, Users, Trophy, HelpCircle, User, LogOut, Volume2, VolumeX, Flame, Zap, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import audioManager from '../game/engine/AudioManager';

export function MainMenu({
  onStartSinglePlayer,
  onOpenMultiplayer,
  onOpenLeaderboard,
  onOpenControls,
  onOpenShop,
  onOpenAuth,
  totalCoins = 0,
  isMuted,
  onToggleMute
}) {
  const { user, logout } = useAuth();

  return (
    <div className="main-menu-container">
      {/* Background Animated Gradient & Particle Layer */}
      <div className="main-menu-backdrop" />
      <div className="main-menu-grid" />

      {/* Top Navigation Bar: Profile/Login, Coin Wallet & Mute */}
      <div className="menu-top-nav">
        <div className="menu-nav-left">
          {user ? (
            <div className="menu-user-btn">
              <div className="menu-user-avatar">
                {user.username ? user.username[0].toUpperCase() : 'M'}
              </div>
              <span className="menu-username">{user.username}</span>
              <button
                onClick={logout}
                className="menu-logout-btn"
                title="Log Out"
                id="btn-user-logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="menu-user-btn"
              id="btn-login-register"
            >
              <User size={15} style={{ color: '#f87171' }} />
              <span>Login / Register</span>
            </button>
          )}
        </div>

        <div className="menu-nav-right">
          {/* Persistent Coin Wallet Button */}
          <button
            onClick={onOpenShop}
            className="menu-user-btn"
            id="btn-coin-counter"
            title="Open Character & Costume Shop"
            style={{ borderColor: 'rgba(245, 158, 11, 0.45)', background: 'rgba(245, 158, 11, 0.14)' }}
          >
            <span style={{ fontSize: '14px' }}>🪙</span>
            <span style={{ color: '#fbbf24', fontFamily: 'var(--font-retro)', fontSize: '10px' }}>
              {totalCoins.toLocaleString()} COINS
            </span>
          </button>

          <button
            onClick={onToggleMute}
            className="menu-icon-btn"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            id="btn-toggle-sound"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Center Hero: Badges, Titles, Description, and Action Buttons */}
      <div className="menu-center-hero">
        <div className="menu-badge">
          <Flame size={13} style={{ color: '#ef4444' }} />
          <span>HD SURVIVAL PLATFORMER</span>
          <Zap size={13} style={{ color: '#facc15' }} />
        </div>

        <h1 className="menu-title-primary">
          SUPER MARIO
        </h1>
        <h2 className="menu-title-secondary">
          SURVIVAL EDITION
        </h2>

        <p className="menu-description">
          Manage your stamina, avoid rock head-bumps, scavenge rations, collect coins across 3 epic levels, and conquer real-time co-op or solo runs.
        </p>

        {/* Primary Action Buttons */}
        <div className="menu-btn-row-primary">
          <button
            onClick={onStartSinglePlayer}
            className="btn-arcade btn-primary menu-btn-full"
            id="btn-start-solo"
          >
            <Play size={16} fill="currentColor" /> START SOLO RUN
          </button>
          <button
            onClick={onOpenMultiplayer}
            className="btn-arcade btn-blue menu-btn-full"
            id="btn-coop-multi"
          >
            <Users size={16} /> CO-OP MULTI
          </button>
        </div>

        {/* Secondary Navigation Buttons: Shop, Leaderboard, Controls */}
        <div className="menu-btn-row-secondary">
          <button
            onClick={onOpenShop}
            className="btn-arcade btn-gold"
            id="btn-shop"
          >
            <ShoppingBag size={14} /> WARDROBE
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="btn-arcade btn-secondary"
            id="btn-leaderboard"
          >
            <Trophy size={14} /> LEADERBOARD
          </button>
          <button
            onClick={onOpenControls}
            className="btn-arcade btn-secondary"
            id="btn-controls"
          >
            <HelpCircle size={14} /> CONTROLS
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="menu-footer">
        <span>Powered by MERN Stack + Socket.IO + Web Audio API</span>
        <span>v2.0.0 • Clean Vector HD Engine</span>
      </div>
    </div>
  );
}

export default MainMenu;
