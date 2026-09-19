import { Physics } from '../engine/Physics';
import spriteFactory from '../engine/SpriteFactory';
import audioManager from '../engine/AudioManager';

export class Projectile {
  constructor(x, y, direction = 'right') {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.vx = direction === 'right' ? 360 : -360;
    this.vy = 120;
    this.isGrounded = false;
    this.active = true;
    this.life = 2.5;

    audioManager.playFireball();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  update(dt, tileMap, particles) {
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    const prevVx = this.vx;
    Physics.updateEntity(this, dt, tileMap);

    // If hits wall, explode
    if (Math.abs(this.vx) < 10 && Math.abs(prevVx) > 50) {
      this.active = false;
      if (particles) particles.emitSparks(this.x + 8, this.y + 8, '#f97316', 8);
      return;
    }

    // Bounce off ground
    if (this.isGrounded) {
      this.vy = -260;
      this.isGrounded = false;
      if (particles) particles.emitDust(this.x + 8, this.y + 16, 2);
    }
  }

  render(ctx, camera) {
    if (!this.active) return;
    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);

    const sprite = spriteFactory.get('projectile_fireball');
    if (sprite) {
      ctx.drawImage(sprite, drawX, drawY, 16, 16);
    }
  }
}
