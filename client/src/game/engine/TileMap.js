import spriteFactory from './SpriteFactory';
import audioManager from './AudioManager';

export const TILE_SIZE = 32;

export const TILE_TYPES = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION: 3,
  QUESTION_EMPTY: 30,
  PIPE_TOP_L: 4,
  PIPE_TOP_R: 5,
  PIPE_BODY_L: 6,
  PIPE_BODY_R: 7,
  SPIKE: 8,
  FLAG_POLE: 9,
  FLAG_TOP: 10
};

export class TileMap {
  constructor(matrix, itemSpawns = {}, onSpawnItem = null, onWin = null) {
    this.matrix = matrix; // 2D array [row][col]
    this.rows = matrix.length;
    this.cols = matrix[0].length;
    this.width = this.cols * TILE_SIZE;
    this.height = this.rows * TILE_SIZE;
    this.itemSpawns = itemSpawns; // "r,c" -> 'mushroom' | 'fireflower' | 'energy' | 'coin'
    this.onSpawnItem = onSpawnItem;
    this.onWin = onWin;
    this.bouncingTiles = new Map(); // "r,c" -> { offsetY, vy }
    this.flagReached = false;
    this.flagY = 64;
  }

  getTile(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return null;
    return this.matrix[r][c];
  }

  setTile(r, c, type) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.matrix[r][c] = type;
    }
  }

  getCollidingTiles(bounds) {
    const tiles = [];
    const minCol = Math.max(0, Math.floor(bounds.x / TILE_SIZE));
    const maxCol = Math.min(this.cols - 1, Math.floor((bounds.x + bounds.width) / TILE_SIZE));
    const minRow = Math.max(0, Math.floor(bounds.y / TILE_SIZE));
    const maxRow = Math.min(this.rows - 1, Math.floor((bounds.y + bounds.height) / TILE_SIZE));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const type = this.matrix[r][c];
        if (type === TILE_TYPES.EMPTY) continue;

        const tileX = c * TILE_SIZE;
        const tileY = r * TILE_SIZE;

        const tileObj = {
          r,
          c,
          x: tileX,
          y: tileY,
          width: TILE_SIZE,
          height: TILE_SIZE,
          type,
          isSolid: this.isTileSolid(type),
          isHazard: type === TILE_TYPES.SPIKE,
          isGoal: type === TILE_TYPES.FLAG_POLE || type === TILE_TYPES.FLAG_TOP
        };

        // Attach bottom hit behavior for blocks & rocks
        if (
          type === TILE_TYPES.QUESTION ||
          type === TILE_TYPES.BRICK ||
          type === TILE_TYPES.QUESTION_EMPTY ||
          type === TILE_TYPES.GROUND
        ) {
          tileObj.onHitFromBottom = (player, particles) => this.handleBlockHit(r, c, type, player, particles);
        }

        tiles.push(tileObj);
      }
    }
    return tiles;
  }

  isTileSolid(type) {
    return (
      type === TILE_TYPES.GROUND ||
      type === TILE_TYPES.BRICK ||
      type === TILE_TYPES.QUESTION ||
      type === TILE_TYPES.QUESTION_EMPTY ||
      type === TILE_TYPES.PIPE_TOP_L ||
      type === TILE_TYPES.PIPE_TOP_R ||
      type === TILE_TYPES.PIPE_BODY_L ||
      type === TILE_TYPES.PIPE_BODY_R
    );
  }

  handleBlockHit(r, c, type, player, particles) {
    const key = `${r},${c}`;
    if (this.bouncingTiles.has(key)) return;

    // Start block bounce animation
    this.bouncingTiles.set(key, { offsetY: 0, vy: -180 });
    audioManager.playBlockHit();

    if (type === TILE_TYPES.QUESTION) {
      this.matrix[r][c] = TILE_TYPES.QUESTION_EMPTY;
      const itemType = this.itemSpawns[key] || 'coin';
      if (itemType === 'coin') {
        audioManager.playCoin();
        player.addScore(200);
        player.addCoins(1);
      } else if (this.onSpawnItem) {
        this.onSpawnItem(itemType, c * TILE_SIZE + 2, (r - 1) * TILE_SIZE);
      }
    } else {
      // Bumping head on solid rock/brick block reduces stamina
      if (player && player.drainHunger) {
        player.drainHunger(8, particles);
        if (particles) {
          particles.emitSparks(c * TILE_SIZE + 16, (r + 1) * TILE_SIZE, '#f97316', 8);
          particles.emitFloatingText('-8 STAMINA', player.x, player.y - 12, '#f97316');
        }
      }

      if (type === TILE_TYPES.BRICK && (player.isSuper || player.isFire)) {
        // Break brick
        this.matrix[r][c] = TILE_TYPES.EMPTY;
        player.addScore(50);
        if (particles) {
          particles.emitSparks(c * TILE_SIZE + 16, r * TILE_SIZE + 16, '#d97706', 16);
        }
      }
    }
  }

  update(dt) {
    // Update bouncing blocks
    this.bouncingTiles.forEach((bounce, key) => {
      bounce.offsetY += bounce.vy * dt;
      bounce.vy += 900 * dt; // gravity returning block down
      if (bounce.offsetY >= 0) {
        this.bouncingTiles.delete(key);
      }
    });

    // Update flag slide if level completed
    if (this.flagReached && this.flagY < this.rows * TILE_SIZE - 96) {
      this.flagY += 120 * dt;
    }
  }

  render(ctx, camera) {
    const minCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const maxCol = Math.min(this.cols - 1, Math.floor((camera.x + camera.width) / TILE_SIZE) + 1);
    const minRow = 0;
    const maxRow = this.rows - 1;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const type = this.matrix[r][c];
        if (type === TILE_TYPES.EMPTY) continue;

        let drawX = c * TILE_SIZE - camera.x;
        let drawY = r * TILE_SIZE - camera.y;

        // Apply bounce offset
        const key = `${r},${c}`;
        if (this.bouncingTiles.has(key)) {
          drawY += this.bouncingTiles.get(key).offsetY;
        }

        switch (type) {
          case TILE_TYPES.GROUND:
            ctx.drawImage(spriteFactory.get('tile_ground'), drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.BRICK:
            ctx.drawImage(spriteFactory.get('block_brick'), drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.QUESTION:
            ctx.drawImage(spriteFactory.get('block_question'), drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.QUESTION_EMPTY:
            ctx.drawImage(spriteFactory.get('block_empty'), drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.PIPE_TOP_L:
            ctx.drawImage(spriteFactory.get('pipe_top'), 0, 0, 32, 32, drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.PIPE_TOP_R:
            ctx.drawImage(spriteFactory.get('pipe_top'), 32, 0, 32, 32, drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.PIPE_BODY_L:
            ctx.drawImage(spriteFactory.get('pipe_body'), 0, 0, 28, 32, drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.PIPE_BODY_R:
            ctx.drawImage(spriteFactory.get('pipe_body'), 28, 0, 28, 32, drawX, drawY, TILE_SIZE, TILE_SIZE);
            break;
          case TILE_TYPES.SPIKE:
            this.renderSpikes(ctx, drawX, drawY);
            break;
          case TILE_TYPES.FLAG_POLE:
            this.renderFlagPole(ctx, drawX, drawY);
            break;
          case TILE_TYPES.FLAG_TOP:
            this.renderFlagTop(ctx, drawX, drawY);
            break;
          default:
            break;
        }
      }
    }

    // Render Goal Flag
    if (this.flagCol !== undefined) {
      const fx = this.flagCol * TILE_SIZE - camera.x + 8;
      const fy = this.flagY - camera.y;
      ctx.drawImage(spriteFactory.get('goal_flag'), fx, fy, 40, 40);
    }
  }

  renderSpikes(ctx, x, y) {
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(x, y + TILE_SIZE);
    ctx.lineTo(x + 8, y + 10);
    ctx.lineTo(x + 16, y + TILE_SIZE);
    ctx.lineTo(x + 24, y + 10);
    ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();
  }

  renderFlagPole(ctx, x, y) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 14, y, 4, TILE_SIZE);
  }

  renderFlagTop(ctx, x, y) {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 14, y + 16, 4, 16);
  }
}
