import spriteFactory from '../engine/SpriteFactory';
import audioManager from '../engine/AudioManager';
import { Physics } from '../engine/Physics';

export class CoinItem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = 22;
    this.height = 22;
    this.collected = false;
    this.animTimer = Math.random() * Math.PI * 2;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  update(dt) {
    if (this.collected) return;
    this.animTimer += dt * 3.5;
    // Gentle floating bob
    this.y = this.baseY + Math.sin(this.animTimer) * 3.5;
  }

  collect(player, particles) {
    if (this.collected) return;
    this.collected = true;

    audioManager.playCoin();
    player.addCoins(1);
    player.addScore(200);

    if (particles) {
      particles.emitSparks(this.x + 11, this.y + 11, '#fbbf24', 10);
      particles.emitFloatingText('+1 🪙', this.x, this.y - 12, '#facc15');
    }
  }

  render(ctx, camera) {
    if (this.collected) return;

    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);

    if (drawX < -32 || drawX > camera.width + 32) return;

    const sprite = spriteFactory.get('coin');
    if (sprite) {
      ctx.drawImage(sprite, drawX - 2, drawY - 2, 26, 26);
    }
  }
}

export default CoinItem;
