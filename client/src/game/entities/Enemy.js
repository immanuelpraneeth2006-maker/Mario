import { Physics } from '../engine/Physics';
import spriteFactory from '../engine/SpriteFactory';
import audioManager from '../engine/AudioManager';

export class Enemy {
  constructor(x, y, type = 'goomba') {
    this.x = x;
    this.y = y;
    this.type = type; // 'goomba' or 'koopa'
    this.width = 28;
    this.height = 28;

    this.vx = -45; // Starts patrolling left
    this.vy = 0;
    this.isGrounded = false;
    this.isDead = false;
    this.deadTimer = 0;
    this.scoreValue = type === 'goomba' ? 100 : 200;
  }

  getBounds() {
    return {
      x: this.x + 2,
      y: this.y + 2,
      width: this.width - 4,
      height: this.height - 4
    };
  }

  stomp(particles) {
    if (this.isDead) return;
    this.isDead = true;
    this.deadTimer = 0.5;
    this.vx = 0;
    this.vy = 0;
    audioManager.playStomp();
    if (particles) {
      particles.emitSparks(this.x + 14, this.y + 14, '#f59e0b', 8);
      particles.emitFloatingText(`+${this.scoreValue}`, this.x, this.y - 12, '#ffffff');
    }
  }

  defeatByFire(particles) {
    if (this.isDead) return;
    this.isDead = true;
    this.deadTimer = 0.4;
    this.vy = -350;
    this.vx = 80;
    audioManager.playStomp();
    if (particles) {
      particles.emitSparks(this.x + 14, this.y + 14, '#ef4444', 12);
      particles.emitFloatingText(`+${this.scoreValue}`, this.x, this.y - 12, '#f97316');
    }
  }

  update(dt, tileMap, particles) {
    if (this.isDead) {
      this.deadTimer -= dt;
      if (this.type === 'koopa') {
        this.vy += 1200 * dt;
        this.y += this.vy * dt;
        this.x += this.vx * dt;
      }
      return;
    }

    const prevVx = this.vx;
    Physics.updateEntity(this, dt, tileMap);

    // If collided with wall horizontally, reverse patrol direction
    if (Math.abs(this.vx) < 1 && Math.abs(prevVx) > 10) {
      this.vx = -prevVx;
    }
  }

  render(ctx, camera) {
    if (this.isDead && this.deadTimer <= 0) return;

    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);

    if (this.type === 'goomba') {
      const spriteName = this.isDead ? 'goomba_flat' : 'goomba_walk';
      const sprite = spriteFactory.get(spriteName);
      if (sprite) {
        ctx.drawImage(sprite, drawX, drawY, 30, 30);
      }
    } else if (this.type === 'koopa') {
      const sprite = spriteFactory.get('koopa_walk');
      if (sprite) {
        ctx.drawImage(sprite, drawX, drawY, 30, 32);
      }
    }
  }
}
