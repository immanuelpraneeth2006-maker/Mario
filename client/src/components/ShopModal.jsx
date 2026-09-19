import React from 'react';
import { X, Check, Lock, ShoppingBag, ShieldCheck } from 'lucide-react';
import spriteFactory from '../game/engine/SpriteFactory';

export const COSTUMES = [
  {
    id: 'classic',
    name: 'Classic Mario',
    subtitle: 'The Legendary Plumber',
    price: 0,
    badge: 'CLASSIC',
    accentColor: '#ef4444',
    description: 'Iconic scarlet cap & cobalt blue overalls. Balanced, nimble, and timeless.'
  },
  {
    id: 'luigi',
    name: 'Emerald Luigi',
    subtitle: 'High-Jumping Brother',
    price: 30,
    badge: 'EMERALD',
    accentColor: '#16a34a',
    description: 'Vibrant green cap & shirt with blue overalls. Agile brother with high leaps.'
  },
  {
    id: 'fire',
    name: 'Fire Mario',
    subtitle: 'Flame Blossom Warrior',
    price: 60,
    badge: 'FIRE',
    accentColor: '#f97316',
    description: 'Striking pearl-white cap & shirt with fiery crimson overalls.'
  },
  {
    id: 'shadow',
    name: 'Shadow Shinobi',
    subtitle: 'Midnight Ninja Mario',
    price: 90,
    badge: 'SHINOBI',
    accentColor: '#dc2626',
    description: 'Stealth midnight obsidian suit with glowing crimson eyes and shadow boots.'
  },
  {
    id: 'gold',
    name: 'Golden Mario',
    subtitle: 'Midas Champion',
    price: 150,
    badge: 'GOLDEN',
    accentColor: '#f59e0b',
    description: 'Gleaming 24K pure gold suit and cap, radiating high prestige and wealth.'
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    subtitle: 'Neon Syndicate Runner',
    price: 200,
    badge: 'CYBER',
    accentColor: '#00f0ff',
    description: 'Electric cyan cap & suit with deep navy overalls and neon cyber glow.'
  }
];

export function ShopModal({
  onClose,
  totalCoins = 0,
  unlockedCostumes = ['classic'],
  equippedCostume = 'classic',
  onBuyCostume,
  onEquipCostume
}) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-panel p-6 max-w-3xl w-full border border-white/20 shadow-2xl flex flex-col gap-4 text-white font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-yellow-400" size={24} />
            <div>
              <h2 className="font-retro text-sm text-yellow-400">HERO WARDROBE & COSTUME SHOP</h2>
              <p className="text-[11px] text-zinc-400 font-sans">Choose your hero's look and collect coins to unlock new costumes!</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="coin-wallet-badge">
              <span>🪙</span>
              <span>{totalCoins.toLocaleString()} COINS</span>
            </div>
            <button
              onClick={onClose}
              id="btn-close-shop"
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close Shop"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Costumes Grid with VISIBLE Pixel Art Characters */}
        <div className="shop-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
          {COSTUMES.map((item) => {
            const isUnlocked = unlockedCostumes.includes(item.id);
            const isEquipped = equippedCostume === item.id;
            const canAfford = totalCoins >= item.price;
            const previewUrl = spriteFactory.getCostumePreview(item.id);

            return (
              <div
                key={item.id}
                className={`shop-item-card ${isEquipped ? 'is-equipped' : ''}`}
                style={{ gap: '8px' }}
              >
                {/* Badge */}
                <div
                  className="text-[9px] font-retro px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${item.accentColor}22`,
                    border: `1px solid ${item.accentColor}66`,
                    color: item.accentColor
                  }}
                >
                  {item.badge}
                </div>

                {/* FULL VISIBLE CHARACTER SPRITE PREVIEW */}
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '16px',
                    border: `2px solid ${item.accentColor}`,
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.6) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 18px ${item.accentColor}33`
                  }}
                >
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt={item.name}
                      style={{
                        width: '56px',
                        height: '56px',
                        imageRendering: 'pixelated'
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-retro text-xs text-white">{item.name}</h3>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{item.subtitle}</div>
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans flex-1">
                  {item.description}
                </p>

                {/* Action Button */}
                <div className="w-full mt-1">
                  {isEquipped ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-xl bg-blue-600/30 border border-blue-500/50 text-blue-300 font-retro text-[10px] flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <Check size={14} /> EQUIPPED
                    </button>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => onEquipCostume(item.id)}
                      className="btn-arcade btn-blue w-full py-2 text-[10px]"
                    >
                      <ShieldCheck size={14} /> EQUIP
                    </button>
                  ) : canAfford ? (
                    <button
                      onClick={() => onBuyCostume(item.id, item.price)}
                      className="btn-arcade btn-gold w-full py-2 text-[10px]"
                    >
                      <span>🪙</span> UNLOCK ({item.price})
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500 font-retro text-[9px] flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock size={12} /> NEED {item.price} COINS
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center border-t border-white/10 pt-3 text-[11px] text-zinc-400">
          <span>Tip: Hit question blocks and discover floating coin arches in levels to earn coins!</span>
          <button onClick={onClose} id="btn-shop-done" className="btn-arcade btn-secondary py-2 px-5 text-[10px]">
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopModal;
