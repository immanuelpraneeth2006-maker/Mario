import { TileMap, TILE_SIZE, TILE_TYPES } from './engine/TileMap';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { PowerUp } from './entities/PowerUp';
import { Projectile } from './entities/Projectile';
import { CoinItem } from './entities/CoinItem';
import { ParticleSystem } from './engine/ParticleSystem';
import { Physics } from './engine/Physics';
import spriteFactory from './engine/SpriteFactory';
import audioManager from './engine/AudioManager';
import { createLevel1 } from './levels/level1';
import { createLevel2 } from './levels/level2';
import { createLevel3 } from './levels/level3';

export class GameEngine {
  constructor(canvas, { onHudUpdate, onGameOver, onVictory, onCoinCollected, socketService = null, costume = 'classic' }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.onHudUpdate = onHudUpdate;
    this.onGameOver = onGameOver;
    this.onVictory = onVictory;
    this.onCoinCollected = onCoinCollected;
    this.socketService = socketService;
    this.costume = costume || 'classic';

    // Responsive Widescreen Resolution: dynamically matches viewport aspect ratio
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.viewHeight = 480; // Matches exactly 15 vertical tiles (15 * 32 = 480px)
    this.viewWidth = Math.min(1060, Math.max(800, Math.round(this.viewHeight * aspect)));
    this.canvas.width = this.viewWidth;
    this.canvas.height = this.viewHeight;

    this.camera = {
      x: 0,
      y: 0,
      width: this.viewWidth,
      height: this.viewHeight
    };

    this.input = {
      left: false,
      right: false,
      jump: false,
      jumpJustPressed: false,
      down: false,
      sprint: false,
      shoot: false,
      shootJustPressed: false
    };

    this.particles = new ParticleSystem();
    this.remotePlayers = new Map();

    this.isRunning = false;
    this.isPaused = false;
    this.isCleared = false;
    this.transitionBanner = null;
    this.lastTime = 0;
    this.animationFrameId = null;

    this.initLevel(1);
    this.setupNetworkListeners();
  }

  initLevel(levelNumber = 1) {
    const prevScore = this.player ? this.player.score : 0;
    const prevCoins = this.player ? this.player.coins : 0;
    const prevHealth = this.player ? Math.max(1, this.player.health) : 3;
    const prevHunger = this.player ? Math.max(75, this.player.hunger) : 100;
    const prevIsFire = this.player ? this.player.isFire : false;

    let levelData;
    if (levelNumber === 2) {
      levelData = createLevel2();
    } else if (levelNumber === 3) {
      levelData = createLevel3();
    } else {
      levelData = createLevel1();
    }

    this.levelNumber = levelNumber;
    this.levelData = levelData;
    this.timeRemaining = levelData.timeLimit;
    this.timeElapsed = 0;
    this.isCleared = false;
    this.transitionBanner = null;

    this.player = new Player(64, 320, this.costume);
    this.player.score = prevScore;
    this.player.coins = prevCoins;
    this.player.health = prevHealth;
    this.player.hunger = prevHunger;
    this.player.isFire = prevIsFire;

    this.enemies = levelData.enemySpawns.map(e => new Enemy(e.x, e.y, e.type));
    this.powerUps = [];
    this.projectiles = [];
    this.floatingCoins = (levelData.coins || []).map(c => new CoinItem(c.x, c.y));

    this.tileMap = new TileMap(
      levelData.matrix,
      levelData.itemSpawns,
      (type, x, y) => this.spawnItem(type, x, y),
      () => this.triggerVictory()
    );
    this.tileMap.flagCol = levelData.flagCol;

    this.particles.clear();
    this.camera.x = 0;
    this.camera.y = 0;
  }

  spawnItem(type, x, y) {
    const p = new PowerUp(x, y, type);
    this.powerUps.push(p);
  }

  setupNetworkListeners() {
    if (!this.socketService) return;

    this.socketService.on('playerMoved', (data) => {
      this.remotePlayers.set(data.id, data);
    });

    this.socketService.on('playerLeft', ({ id }) => {
      this.remotePlayers.delete(id);
    });

    this.socketService.on('remoteAction', (action) => {
      if (action.type === 'shoot') {
        const proj = new Projectile(action.x, action.y, action.facing);
        this.projectiles.push(proj);
      }
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    audioManager.startMusic();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    audioManager.stopMusic();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(dt);
      this.render();
    }

    // Reset single-frame triggers
    this.input.jumpJustPressed = false;
    this.input.shootJustPressed = false;

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (this.isCleared) {
      this.tileMap.update(dt);
      this.particles.update(dt);
      return;
    }

    this.timeElapsed += dt;
    this.timeRemaining = Math.max(0, this.timeRemaining - dt);

    if (this.timeRemaining <= 0 && !this.player.isDead) {
      this.player.die('timeout');
    }

    // Handle Fireball Shoot
    if (this.input.shootJustPressed && this.player.isFire && this.player.shootCooldown <= 0) {
      const projX = this.player.facing === 'right' ? this.player.x + 24 : this.player.x - 8;
      const proj = new Projectile(projX, this.player.y + 10, this.player.facing);
      this.projectiles.push(proj);
      this.player.shootCooldown = 0.35;

      if (this.socketService) {
        this.socketService.emit('playerAction', {
          type: 'shoot',
          x: projX,
          y: this.player.y + 10,
          facing: this.player.facing
        });
      }
    }

    // Update Player & Check Exhaustion
    this.player.handleInput(this.input, dt, this.particles);
    this.player.update(dt, this.tileMap, this.particles);

    // Camera follow with smooth lerp
    const targetCamX = this.player.x - this.viewWidth * 0.35;
    this.camera.x += (targetCamX - this.camera.x) * 9 * dt;
    this.camera.x = Math.max(0, Math.min(this.tileMap.width - this.viewWidth, this.camera.x));
    this.camera.y = 0; // 480px height fits all 15 rows cleanly

    // Check Spike hazard and Goal flag collision
    const collidingTiles = this.tileMap.getCollidingTiles(this.player.getBounds());
    for (const t of collidingTiles) {
      if (t.isHazard) {
        this.player.takeDamage(1, this.particles);
      }
      if (t.isGoal && !this.isCleared) {
        this.triggerVictory();
      }
    }

    // Update Floating Collectible Coins
    for (let i = this.floatingCoins.length - 1; i >= 0; i--) {
      const coin = this.floatingCoins[i];
      coin.update(dt);
      if (coin.collected) {
        this.floatingCoins.splice(i, 1);
        continue;
      }
      if (Physics.checkAABB(this.player.getBounds(), coin.getBounds())) {
        coin.collect(this.player, this.particles);
        if (this.onCoinCollected) this.onCoinCollected(1);
      }
    }

    // Update Enemies & Stomp Interactions
    for (const enemy of this.enemies) {
      enemy.update(dt, this.tileMap, this.particles);
      if (enemy.isDead || this.player.isDead) continue;

      if (Physics.checkAABB(this.player.getBounds(), enemy.getBounds())) {
        const isLandingOnTop = (this.player.vy > 0 && this.player.y + this.player.height - enemy.y < 22);
        if (isLandingOnTop) {
          enemy.stomp(this.particles);
          this.player.vy = -430; // Snappy bounce boost
          this.player.jumpCount = 1;
          this.player.addScore(enemy.scoreValue);
        } else {
          this.player.takeDamage(1, this.particles);
        }
      }
    }

    // Update Projectiles & Enemy collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, this.tileMap, this.particles);
      if (!proj.active) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (const enemy of this.enemies) {
        if (!enemy.isDead && Physics.checkAABB(proj.getBounds(), enemy.getBounds())) {
          enemy.defeatByFire(this.particles);
          proj.active = false;
          this.player.addScore(enemy.scoreValue);
          break;
        }
      }
    }

    // Update Power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.update(dt, this.tileMap);
      if (p.collected) {
        this.powerUps.splice(i, 1);
        continue;
      }
      if (Physics.checkAABB(this.player.getBounds(), p.getBounds())) {
        p.collect(this.player, this.particles);
        if (p.type === 'coin' && this.onCoinCollected) {
          this.onCoinCollected(1);
        }
      }
    }

    // Update dynamic block bounces and particles
    this.tileMap.update(dt);
    this.particles.update(dt);

    // Check Player Death
    if (this.player.isDead && (this.player.y > this.tileMap.height + 150 || this.player.deathReason === 'exhaustion')) {
      if (this.onGameOver) {
        this.onGameOver({
          score: this.player.score,
          coins: this.player.coins,
          timeElapsed: Math.round(this.timeElapsed),
          deathReason: this.player.deathReason
        });
      }
    }

    // Broadcast position to Socket.IO room if connected
    if (this.socketService && Math.floor(this.timeElapsed * 30) % 2 === 0) {
      this.socketService.emit('playerMove', {
        x: this.player.x,
        y: this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
        facing: this.player.facing,
        isGrounded: this.player.isGrounded,
        health: this.player.health,
        hunger: this.player.hunger,
        score: this.player.score,
        costume: this.costume
      });
    }

    // Update HUD React State
    if (this.onHudUpdate) {
      this.onHudUpdate({
        health: this.player.health,
        maxHealth: this.player.maxHealth,
        hunger: Math.round(this.player.hunger),
        score: this.player.score,
        coins: this.player.coins,
        time: Math.ceil(this.timeRemaining),
        isFire: this.player.isFire,
        level: this.levelNumber,
        levelName: this.levelData ? this.levelData.name : 'World 1'
      });
    }
  }

  triggerVictory() {
    if (this.isCleared) return;
    this.isCleared = true;
    this.tileMap.flagReached = true;
    audioManager.playVictory();

    const timeBonus = Math.round(this.timeRemaining) * 50;
    const hungerBonus = Math.round(this.player.hunger) * 20;
    this.player.score += timeBonus + hungerBonus;

    this.particles.emitFloatingText(`LEVEL CLEAR! +${timeBonus + hungerBonus}`, this.player.x, this.player.y - 30, '#10b981');

    // Multi-level progression!
    if (this.levelNumber < 3) {
      const nextLvl = this.levelNumber + 1;
      const nextName = nextLvl === 2 ? 'Crystal Caverns' : 'Sky Citadel';

      this.transitionBanner = {
        title: `WORLD 1-${this.levelNumber} COMPLETE!`,
        subtitle: `Entering World 1-${nextLvl}: ${nextName}`
      };

      setTimeout(() => {
        this.initLevel(nextLvl);
      }, 2400);
    } else {
      // Grand Victory on Level 3!
      setTimeout(() => {
        if (this.onVictory) {
          this.onVictory({
            score: this.player.score,
            coins: this.player.coins,
            timeElapsed: Math.round(this.timeElapsed),
            timeBonus,
            hungerBonus,
            levelId: this.levelNumber
          });
        }
      }, 2000);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);

    // 1. Theme-Specific HD Sky Backdrop
    const theme = this.levelData ? this.levelData.theme : 'grassland';
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.viewHeight);

    if (theme === 'cavern') {
      // Deep Underground Cavern Gradient
      skyGrad.addColorStop(0, '#060913');
      skyGrad.addColorStop(0.5, '#0f172a');
      skyGrad.addColorStop(1, '#1e1b4b');
    } else if (theme === 'citadel') {
      // High Sky Sunset Citadel
      skyGrad.addColorStop(0, '#7c2d12');
      skyGrad.addColorStop(0.35, '#c2410c');
      skyGrad.addColorStop(0.7, '#ea580c');
      skyGrad.addColorStop(1, '#facc15');
    } else {
      // Verdant Plains Daytime Sky
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.5, '#38bdf8');
      skyGrad.addColorStop(1, '#bae6fd');
    }

    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    // 2. Parallax Scenery
    this.renderParallaxScenery(theme);

    // 3. TileMap
    this.tileMap.render(this.ctx, this.camera);

    // 4. Floating Collectible Coins
    for (const coin of this.floatingCoins) {
      coin.render(this.ctx, this.camera);
    }

    // 5. PowerUps
    for (const p of this.powerUps) {
      p.render(this.ctx, this.camera);
    }

    // 6. Enemies
    for (const enemy of this.enemies) {
      enemy.render(this.ctx, this.camera);
    }

    // 7. Projectiles
    for (const proj of this.projectiles) {
      proj.render(this.ctx, this.camera);
    }

    // 8. Remote Players (Multiplayer)
    this.renderRemotePlayers();

    // 9. Main Local Player (HD Illustrated Avatar)
    this.player.render(this.ctx, this.camera);

    // 10. Particle System & Floating Numbers
    this.particles.render(this.ctx, this.camera);

    // 11. Level Clear Transition Banner Overlay
    if (this.transitionBanner) {
      this.renderTransitionBanner();
    }
  }

  renderParallaxScenery(theme) {
    if (theme === 'cavern') {
      // Underground Cavern Back-Stalactites & Glow
      this.ctx.fillStyle = 'rgba(30, 27, 75, 0.6)';
      const bgOffset = -this.camera.x * 0.25;
      for (let x = -100; x < this.tileMap.width; x += 320) {
        const sx = x + bgOffset;
        if (sx + 320 < 0 || sx > this.viewWidth) continue;
        // Hanging rock stalactite
        this.ctx.beginPath();
        this.ctx.moveTo(sx, 0);
        this.ctx.lineTo(sx + 80, 180);
        this.ctx.lineTo(sx + 160, 0);
        this.ctx.closePath();
        this.ctx.fill();
      }
      return;
    }

    if (theme === 'citadel') {
      // High Sky Sunset Clouds & Floating Islands
      this.ctx.fillStyle = 'rgba(255, 237, 213, 0.4)';
      const cloudOffset = (this.timeElapsed * 12 - this.camera.x * 0.15) % (this.viewWidth + 300);
      for (let i = 0; i < 4; i++) {
        let cx = ((cloudOffset + i * 280) % (this.viewWidth + 300)) - 100;
        this.ctx.beginPath();
        this.ctx.ellipse(cx + 40, 90 + (i % 2) * 50, 70, 22, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      return;
    }

    // Verdant Plains: Fluffy clouds and rolling green hills
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    const cloudOffset = (this.timeElapsed * 18 - this.camera.x * 0.2) % (this.viewWidth + 350);
    const clouds = [
      { x: cloudOffset + 50, y: 50, w: 90, h: 32 },
      { x: cloudOffset + 380, y: 80, w: 120, h: 38 },
      { x: cloudOffset + 750, y: 40, w: 80, h: 28 },
      { x: cloudOffset - 250, y: 70, w: 100, h: 34 }
    ];
    for (const c of clouds) {
      let cx = (c.x % (this.viewWidth + 400)) - 100;
      this.ctx.beginPath();
      this.ctx.arc(cx + 20, c.y + 20, 20, 0, Math.PI * 2);
      this.ctx.arc(cx + 48, c.y + 12, 24, 0, Math.PI * 2);
      this.ctx.arc(cx + 74, c.y + 20, 18, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Rolling Green Hills in background
    const hillOffset = -this.camera.x * 0.35;
    this.ctx.fillStyle = '#22c55e';
    for (let x = -200; x < this.tileMap.width; x += 440) {
      const hx = x + hillOffset;
      if (hx + 440 < 0 || hx > this.viewWidth) continue;
      this.ctx.beginPath();
      this.ctx.arc(hx + 220, 500, 200, Math.PI, 0);
      this.ctx.fill();
    }
  }

  renderTransitionBanner() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    this.ctx.fillStyle = '#facc15';
    this.ctx.font = 'bold 24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = 18;
    this.ctx.fillText(this.transitionBanner.title, this.viewWidth / 2, this.viewHeight / 2 - 15);

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.font = '600 16px "Outfit", sans-serif';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText(this.transitionBanner.subtitle, this.viewWidth / 2, this.viewHeight / 2 + 25);
    this.ctx.restore();
  }

  renderRemotePlayers() {
    this.remotePlayers.forEach((rp) => {
      const drawX = Math.round(rp.x - this.camera.x);
      const drawY = Math.round(rp.y - this.camera.y);

      this.ctx.save();
      if (rp.facing === 'left') {
        this.ctx.translate(drawX + 34, drawY);
        this.ctx.scale(-1, 1);
      } else {
        this.ctx.translate(drawX, drawY);
      }

      const remoteCostume = rp.costume || 'classic';
      const sprite = spriteFactory.get(`hero_${remoteCostume}_idle`) || spriteFactory.get('hero_classic_idle');
      if (sprite) {
        ctx.drawImage(sprite, -6, -6, 40, 40);
      }
      this.ctx.restore();

      this.ctx.font = '9px "Press Start 2P", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(rp.username || 'Co-op Ally', drawX + 13, drawY - 10);
    });
  }
}

export default GameEngine;
