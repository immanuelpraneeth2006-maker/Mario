import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import LobbyModal from './components/LobbyModal';
import Leaderboard from './components/Leaderboard';
import ControlsModal from './components/ControlsModal';
import AuthModal from './components/AuthModal';
import ShopModal from './components/ShopModal';
import GameOverModal from './components/GameOverModal';
import VictoryModal from './components/VictoryModal';
import audioManager from './game/engine/AudioManager';

function GameApp() {
  const [screen, setScreen] = useState('MENU'); // 'MENU' | 'PLAYING'
  const [activeModal, setActiveModal] = useState(null); // 'LOBBY' | 'LEADERBOARD' | 'CONTROLS' | 'AUTH' | 'SHOP' | null
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameSessionId, setGameSessionId] = useState(1);

  // Persistent Coins & Wardrobe
  const [totalCoins, setTotalCoins] = useState(() => {
    const saved = localStorage.getItem('mario_total_coins');
    return saved !== null ? parseInt(saved, 10) : 20; // 20 starter coins
  });

  const [unlockedCostumes, setUnlockedCostumes] = useState(() => {
    try {
      const saved = localStorage.getItem('mario_unlocked_costumes');
      return saved ? JSON.parse(saved) : ['classic'];
    } catch {
      return ['classic'];
    }
  });

  const [equippedCostume, setEquippedCostume] = useState(() => {
    return localStorage.getItem('mario_equipped_costume') || 'classic';
  });

  const [endGameStats, setEndGameStats] = useState(null);
  const [isVictory, setIsVictory] = useState(false);

  useEffect(() => {
    localStorage.setItem('mario_total_coins', totalCoins.toString());
  }, [totalCoins]);

  useEffect(() => {
    localStorage.setItem('mario_unlocked_costumes', JSON.stringify(unlockedCostumes));
  }, [unlockedCostumes]);

  useEffect(() => {
    localStorage.setItem('mario_equipped_costume', equippedCostume);
  }, [equippedCostume]);

  const handleStartGame = (multiplayer = false) => {
    setGameSessionId((prev) => prev + 1);
    setIsMultiplayer(multiplayer);
    setActiveModal(null);
    setEndGameStats(null);
    setIsVictory(false);
    setScreen('PLAYING');
  };

  const handleGameOver = (stats) => {
    setEndGameStats(stats);
    setIsVictory(false);
  };

  const handleVictory = (stats) => {
    setEndGameStats(stats);
    setIsVictory(true);
  };

  const handleExitToMenu = () => {
    setEndGameStats(null);
    setIsVictory(false);
    setScreen('MENU');
    audioManager.stopMusic();
  };

  const handleToggleMute = () => {
    const nextMuted = audioManager.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleCoinCollected = (amount = 1) => {
    setTotalCoins((prev) => prev + amount);
  };

  const handleBuyCostume = (costumeId, price) => {
    if (totalCoins >= price && !unlockedCostumes.includes(costumeId)) {
      setTotalCoins((prev) => prev - price);
      setUnlockedCostumes((prev) => [...prev, costumeId]);
      setEquippedCostume(costumeId);
      audioManager.playPowerUp();
    }
  };

  const handleEquipCostume = (costumeId) => {
    if (unlockedCostumes.includes(costumeId)) {
      setEquippedCostume(costumeId);
      audioManager.playJump();
    }
  };

  return (
    <div className="game-viewport-container">
      {screen === 'MENU' && (
        <MainMenu
          onStartSinglePlayer={() => handleStartGame(false)}
          onOpenMultiplayer={() => setActiveModal('LOBBY')}
          onOpenLeaderboard={() => setActiveModal('LEADERBOARD')}
          onOpenControls={() => setActiveModal('CONTROLS')}
          onOpenShop={() => setActiveModal('SHOP')}
          onOpenAuth={() => setActiveModal('AUTH')}
          totalCoins={totalCoins}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'PLAYING' && (
        <GameCanvas
          key={`session_${gameSessionId}_${isMultiplayer ? 'multi' : 'single'}`}
          isMultiplayer={isMultiplayer}
          costume={equippedCostume}
          onCoinCollected={handleCoinCollected}
          onGameOver={handleGameOver}
          onVictory={handleVictory}
          onExitToMenu={handleExitToMenu}
        />
      )}

      {/* Modal Dialogs */}
      {activeModal === 'SHOP' && (
        <ShopModal
          onClose={() => setActiveModal(null)}
          totalCoins={totalCoins}
          unlockedCostumes={unlockedCostumes}
          equippedCostume={equippedCostume}
          onBuyCostume={handleBuyCostume}
          onEquipCostume={handleEquipCostume}
        />
      )}

      {activeModal === 'LOBBY' && (
        <LobbyModal
          onClose={() => setActiveModal(null)}
          onStartGame={() => handleStartGame(true)}
        />
      )}

      {activeModal === 'LEADERBOARD' && (
        <Leaderboard onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'CONTROLS' && (
        <ControlsModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'AUTH' && (
        <AuthModal onClose={() => setActiveModal(null)} />
      )}

      {/* End Game Overlays */}
      {endGameStats && !isVictory && (
        <GameOverModal
          stats={endGameStats}
          onRetry={() => handleStartGame(isMultiplayer)}
          onExitToMenu={handleExitToMenu}
        />
      )}

      {endGameStats && isVictory && (
        <VictoryModal
          stats={endGameStats}
          onRetry={() => handleStartGame(isMultiplayer)}
          onExitToMenu={handleExitToMenu}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <GameApp />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
