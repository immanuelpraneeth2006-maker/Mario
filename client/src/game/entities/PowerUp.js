import { Physics } from '../engine/Physics';
import spriteFactory from '../engine/SpriteFactory';
import audioManager from '../engine/AudioManager';

export class PowerUp {
  constructor(x, y, type = 'mushroom') {
    this.x = x;
    this.y = y;
    this.type = type; // 'mushroom' | 'fireflower' | 'energy' | 'coin'
    this.width = 24;
    this.height = 24;
    this.vx = type === 'mushroom' ? 60 : 0;
    this.vy = type === 'coin' ? -280 : -100;
    this.isGrounded = false;
    this.collected = false;
    this.life = 15; // 15 seconds to collect
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  collect(player, particles) {
    if (this.collected) return;
    this.collected = true;

    if (this.type === 'mushroom') {
      audioManager.playPowerUp();
      player.addHealth(1);
      player.addScore(1000);
      player.restoreHunger(25);
      particles.emitSparks(this.x + 12, this.y + 12, '#ef4444', 12);
      particles.emitFloatingText('+1 HP & FOOD!', this.x, this.y - 12, '#22c55e');
    } else if (this.type === 'energy') {
      audioManager.playPowerUp();
      player.restoreHunger(45);
      player.addScore(500);
      particles.emitSparks(this.x + 12, this.y + 12, '#06b6d4', 12);
      particles.emitFloatingText('+45 STAMINA!', this.x, this.y - 12, '#06b6d4');
    } else if (this.type === 'fireflower') {
      audioManager.playPowerUp();
      player.isFire = true;
      player.addScore(1500);
      particles.emitSparks(this.x + 12, this.y + 12, '#f97316', 15);
      particles.emitFloatingText('FIRE POWER!', this.x, this.y - 12, '#f97316');
    } else if (this.type === 'coin') {
      audioManager.playCoin();
      player.addCoins(1);
      player.addScore(200);
      particles.emitSparks(this.x + 12, this.y + 12, '#fbbf24', 8);
      particles.emitFloatingText('+200', this.x, this.y - 12, '#fbbf24');
    }
  }

  update(dt, tileMap) {
    this.life -= dt;
    if (this.life <= 0) {
      this.collected = true;
      return;
    }

    if (this.type === 'coin') {
      this.vy += 800 * dt;
      this.y += this.vy * dt;
      if (this.vy > 100) this.collected = true;
      return;
    }

    if (this.type === 'mushroom') {
      const prevVx = this.vx;
      Physics.updateEntity(this, dt, tileMap);
      if (Math.abs(this.vx) < 1 && Math.abs(prevVx) > 5) {
        this.vx = -prevVx;
      }
    } else {
      // Fireflower or Energy Bar bob slightly in place
      Physics.updateEntity(this, dt, tileMap);
    }
  }

  render(ctx, camera) {
    if (this.collected) return;
    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);

    let spriteName = 'item_mushroom';
    if (this.type === 'energy') spriteName = 'item_energy_bar';
    else if (this.type === 'fireflower') spriteName = 'item_fireflower';
    else if (this.type === 'coin') spriteName = 'coin';

    const sprite = spriteFactory.get(spriteName);
    if (sprite) {
      ctx.drawImage(sprite, drawX, drawY, 26, 26);
    }
  }
}
