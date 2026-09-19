import { Physics } from '../engine/Physics';
import spriteFactory from '../engine/SpriteFactory';
import audioManager from '../engine/AudioManager';

export class Player {
  constructor(x = 64, y = 300, costume = 'classic') {
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.width = 26;
    this.height = 34;
    this.costume = costume || 'classic';

    this.vx = 0;
    this.vy = 0;
    this.facing = 'right';
    this.isGrounded = false;
    this.jumpCount = 0;
    this.maxJumps = 2; // Supports double jump

    // Jump Buffering & Coyote Time for ultra-responsive Mario feel
    this.jumpBufferTimer = 0; // Buffer jump input for 180ms
    this.coyoteTimer = 0;     // Allow jump for 140ms after walking off ledge

    // Crouching state
    this.isCrouching = false;

    // Survival Metrics
    this.health = 3;
    this.maxHealth = 3;
    this.hunger = 100; // 0 - 100
    this.score = 0;
    this.coins = 0;
    this.starvationTimer = 0;

    // Power-up States
    this.isSuper = false;
    this.isFire = false;
    this.shootCooldown = 0;

    // Invulnerability Flash after damage
    this.invulnerableTime = 0;
    this.isDead = false;
    this.deathReason = ''; // 'exhaustion' | 'pitfall' | 'damage'

    // Animation timer
    this.animTimer = 0;
    this.runFrame = 0;
  }

  getBounds() {
    return {
      x: this.x + 3,
      y: this.isCrouching ? this.y + 10 : this.y,
      width: this.width - 6,
      height: this.isCrouching ? this.height - 10 : this.height
    };
  }

  handleInput(input, dt, particles) {
    if (this.isDead) return;

    // Fast, responsive, athletic movement speeds
    const baseSpeed = 290;
    const sprintMultiplier = (input.sprint && this.hunger > 5) ? 1.52 : 1.0;
    const targetSpeed = baseSpeed * sprintMultiplier;

    // Handle Crouching / Fast Fall with S or Down Arrow
    if (input.down) {
      if (this.isGrounded) {
        this.isCrouching = true;
        this.vx *= Math.pow(0.0001, dt); // Slide to a stop when ducking
      } else {
        // Fast-Fall down from the air
        this.vy += 1500 * dt;
        this.isCrouching = false;
      }
    } else {
      this.isCrouching = false;
    }

    // Horizontal Movement (Instant snappy responsiveness!)
    if (!this.isCrouching) {
      if (input.left && !input.right) {
        this.vx = -targetSpeed;
        this.facing = 'left';
      } else if (input.right && !input.left) {
        this.vx = targetSpeed;
        this.facing = 'right';
      } else {
        // Immediate snappy deceleration
        this.vx *= Math.pow(0.00001, dt);
        if (Math.abs(this.vx) < 20) this.vx = 0;
      }
    }

    // Register jump button press into Jump Buffer
    if (input.jumpJustPressed) {
      this.jumpBufferTimer = 0.18; // 180ms buffer
    }

    // Execute Ground Jump / Coyote Time Jump
    const canGroundJump = (this.isGrounded || this.coyoteTimer > 0) && this.jumpCount === 0;
    if (this.jumpBufferTimer > 0 && canGroundJump) {
      this.vy = -590; // Snappy high jump
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.jumpCount = 1;
      audioManager.playJump();
      if (particles) particles.emitDust(this.x + 13, this.y + 34, 6);
      this.drainHunger(1.0, particles);
    }
    // Execute Mid-Air Double Jump
    else if (this.jumpBufferTimer > 0 && !this.isGrounded && this.jumpCount === 1) {
      this.vy = -510;
      this.jumpCount = 2;
      this.jumpBufferTimer = 0;
      audioManager.playDoubleJump();
      if (particles) {
        particles.emitDust(this.x + 13, this.y + 34, 6);
        if (this.costume === 'cyber') particles.emitSparks(this.x + 13, this.y + 30, '#00f0ff', 6);
      }
      this.drainHunger(1.8, particles);
    }

    // Variable Jump Cut: if player releases jump key early while rising
    if (!input.jump && this.vy < -300) {
      this.vy = -300;
    }

    // Sprinting hunger drain
    if (input.sprint && Math.abs(this.vx) > 30) {
      this.drainHunger(dt * 2.2, particles);
    }
  }

  drainHunger(amount, particles = null) {
    if (this.isDead) return;
    this.hunger = Math.max(0, this.hunger - amount);

    // If stamina finishes in mid game -> Lose the game immediately!
    if (this.hunger <= 0) {
      this.die('exhaustion');
      if (particles) {
        particles.emitFloatingText('EXHAUSTED! OUT OF STAMINA', this.x, this.y - 14, '#ef4444');
        particles.emitSparks(this.x + 13, this.y + 17, '#ef4444', 16);
      }
    }
  }

  restoreHunger(amount) {
    this.hunger = Math.min(100, this.hunger + amount);
  }

  addHealth(amount = 1) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addScore(amount) {
    this.score += amount;
  }

  addCoins(amount = 1) {
    this.coins += amount;
    if (this.coins >= 100) {
      this.coins -= 100;
      this.addHealth(1);
      audioManager.playPowerUp();
    }
  }

  takeDamage(amount = 1, particles) {
    if (this.invulnerableTime > 0 || this.isDead) return;

    if (this.isFire) {
      this.isFire = false;
      this.invulnerableTime = 1.6;
      audioManager.playHurt();
      if (particles) particles.emitSparks(this.x + 13, this.y + 17, '#ef4444', 10);
      return;
    }

    this.health -= amount;
    this.invulnerableTime = 1.6;
    audioManager.playHurt();
    if (particles) {
      particles.emitSparks(this.x + 13, this.y + 17, '#ef4444', 12);
      particles.emitFloatingText(`-${amount} HP!`, this.x, this.y - 12, '#ef4444');
    }

    // Knockback
    this.vy = -340;
    this.vx = this.facing === 'right' ? -180 : 180;

    if (this.health <= 0) {
      this.die('damage');
    }
  }

  die(reason = 'damage') {
    if (this.isDead) return;
    this.isDead = true;
    this.deathReason = reason;
    this.health = 0;
    this.vy = -640;
    this.vx = 0;
    audioManager.playGameOver();
  }

  update(dt, tileMap, particles) {
    if (this.isDead) {
      this.vy += 1600 * dt;
      this.y += this.vy * dt;
      return;
    }

    // Update Jump Buffer & Coyote timers
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;

    if (this.isGrounded) {
      this.coyoteTimer = 0.14; // Refresh coyote time while on ground
      this.jumpCount = 0;
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
    }

    // Passive hunger/stamina drain over time
    this.drainHunger(dt * 0.7, particles);

    // Cooldowns
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;

    // Physics update with tile collision and head-bump stamina penalty
    Physics.updateEntity(this, dt, tileMap, particles);

    // Bottom pitfall death
    if (this.y > tileMap.height + 64) {
      this.die('pitfall');
    }

    // Animation cycle
    this.animTimer += dt;
    if (Math.abs(this.vx) > 15 && this.isGrounded) {
      if (this.animTimer > 0.08) {
        this.runFrame = (this.runFrame + 1) % 2;
        this.animTimer = 0;
        if (Math.random() < 0.3 && particles) {
          particles.emitDust(this.x + 13, this.y + 34, 2);
          if (this.costume === 'cyber') particles.emitSparks(this.x + 13, this.y + 32, '#00f0ff', 2);
          else if (this.costume === 'gold') particles.emitSparks(this.x + 13, this.y + 32, '#fbbf24', 2);
        }
      }
    } else {
      this.runFrame = 0;
    }
  }

  render(ctx, camera) {
    // Flashing effect during invulnerability
    if (this.invulnerableTime > 0 && Math.floor(Date.now() / 90) % 2 === 0) {
      return;
    }

    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);

    ctx.save();

    // Flip context horizontally if facing left
    if (this.facing === 'left') {
      ctx.translate(drawX + 34, drawY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(drawX, drawY);
    }

    // Determine state
    const activeCostume = this.isFire ? 'fire' : (this.costume || 'classic');
    let state = 'idle';

    if (this.isDead || !this.isGrounded) {
      state = 'jump';
    } else if (this.isCrouching) {
      state = 'idle';
    } else if (Math.abs(this.vx) > 15) {
      state = 'run';
    }

    let sprite = spriteFactory.get(`mario_${activeCostume}_${state}`) || spriteFactory.get(`hero_${activeCostume}_${state}`);
    if (!sprite) {
      sprite = spriteFactory.get(`mario_classic_${state}`) || spriteFactory.get('mario_idle_red');
    }

    if (sprite) {
      if (this.isCrouching) {
        // Draw squashed ducking hero
        ctx.drawImage(sprite, 0, 6, 32, 26);
      } else {
        ctx.drawImage(sprite, 0, 0, 32, 32);
      }
    }

    ctx.restore();
  }
}

export default Player;
