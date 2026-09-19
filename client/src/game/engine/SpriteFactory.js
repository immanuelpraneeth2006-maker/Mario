/**
 * Authentic Retro Pixel Art Sprite Generator & Costume Factory
 * Generates classic NES/SNES style pixel art sprites with pixelated rendering.
 * Provides distinct costumes for Mario and generates crisp 64x64 character preview images for the Wardrobe.
 */

class SpriteFactory {
  constructor() {
    this.cache = new Map();
    this.previewUrls = new Map();
    this.initSprites();
  }

  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // Draw pixel grid from ascii map
  drawAsciiGrid(ctx, map, palette, pixelSize = 2, offsetX = 0, offsetY = 0) {
    for (let r = 0; r < map.length; r++) {
      const line = map[r];
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char !== ' ' && char !== '.' && palette[char]) {
          ctx.fillStyle = palette[char];
          ctx.fillRect(offsetX + c * pixelSize, offsetY + r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  initSprites() {
    this.initCostumes();
    this.initEnemySprites();
    this.initTileAndItemSprites();
  }

  /* ========================================================
     1. MARIO COSTUMES (16x16 Pixel Grid -> 32x32 Game, 64x64 Preview)
     ======================================================== */
  initCostumes() {
    // Shared 16x16 Mario Animation Frames
    const marioIdle = [
      "....RRRRR.......",
      "...RRRRRRRRR....",
      "...DDDSSS.S.....",
      "..DSDSSSDSSSS...",
      "..DSDDDSSSSSS...",
      "..DDSSSSDDDD....",
      "....SSSSSSSS....",
      "...RRRRBRRRR....",
      "..RRRRRBRRRRR...",
      ".RRRRRRBBRRRRR..",
      ".SSSS.BYB.SSSS..",
      "..SSS.BBB.SSS...",
      "..DDD.BBB.DDD...",
      ".....BBBBBB.....",
      "....DDD..DDD....",
      "...DDDD..DDDD..."
    ];

    const marioRun = [
      "....RRRRR.......",
      "...RRRRRRRRR....",
      "...DDDSSS.S.....",
      "..DSDSSSDSSSS...",
      "..DSDDDSSSSSS...",
      "..DDSSSSDDDD....",
      "....SSSSSSSS....",
      "....RRRBRR......",
      "...RRRRBBRRR....",
      "..SSSS.BYB.SS...",
      "..DDD..BBB..DD..",
      "......BBBB......",
      ".....BB.BB......",
      "....DDD..DD.....",
      "...DDDD...DDD...",
      "................"
    ];

    const marioJump = [
      "....RRRRR.......",
      "...RRRRRRRRR....",
      "...DDDSSS.S.....",
      "..DSDSSSDSSSS...",
      "..DSDDDSSSSSS...",
      "..DDSSSSDDDD....",
      "....SSSSSSSS....",
      "..SSRRRBRRR.....",
      "..SSRRRBBRRR....",
      "...DD..BYB.SS...",
      "......BBBB.DD...",
      ".....BBBBBB.....",
      "....DDD..DDD....",
      "...DDDD...DDDD..",
      "..DDDD.....DDDD.",
      "................"
    ];

    // Costume Color Palettes
    const costumePalettes = {
      // 1. Classic Mario (Red & Blue)
      classic: {
        'R': '#e52521', // Red cap & shirt
        'B': '#2563eb', // Blue overalls
        'S': '#fcd34d', // Skin
        'D': '#78350f', // Brown hair & boots
        'W': '#ffffff',
        'K': '#000000',
        'Y': '#fbbf24'  // Gold buttons
      },
      // 2. Luigi / Emerald Hero (Green & Blue)
      luigi: {
        'R': '#16a34a', // Green cap & shirt
        'B': '#2563eb', // Blue overalls
        'S': '#fcd34d',
        'D': '#78350f',
        'W': '#ffffff',
        'K': '#000000',
        'Y': '#fbbf24'
      },
      // 3. Fire Mario (White & Red)
      fire: {
        'R': '#ffffff', // White cap & shirt
        'B': '#e52521', // Red overalls
        'S': '#fcd34d',
        'D': '#78350f',
        'W': '#ffffff',
        'K': '#000000',
        'Y': '#fbbf24'
      },
      // 4. Shadow Shinobi / Dark Mario (Black & Crimson)
      shadow: {
        'R': '#18181b', // Midnight black cap
        'B': '#27272a', // Dark charcoal overalls
        'S': '#fcd34d',
        'D': '#09090b', // Jet black hair/boots
        'W': '#ef4444', // Crimson eyes
        'K': '#000000',
        'Y': '#ef4444'  // Crimson buttons
      },
      // 5. Golden Champion (24K Gold & Yellow)
      gold: {
        'R': '#facc15', // Brilliant gold cap & shirt
        'B': '#d97706', // Amber gold overalls
        'S': '#fef08a', // Pale gold skin
        'D': '#78350f', // Dark amber boots
        'W': '#ffffff',
        'K': '#000000',
        'Y': '#ffffff'  // Diamond button
      },
      // 6. Cyber Blue (Neon Cyan & Navy)
      cyber: {
        'R': '#00f0ff', // Electric cyan cap & shirt
        'B': '#1e293b', // Deep navy overalls
        'S': '#e0f2fe',
        'D': '#0e7490', // Cyan dark boots
        'W': '#00f0ff',
        'K': '#000000',
        'Y': '#f43f5e'  // Pink neon button
      }
    };

    // Build 32x32 sprites for in-game and 64x64 previews for the Wardrobe
    for (const [id, palette] of Object.entries(costumePalettes)) {
      // In-game 32x32 sprites (pixelSize = 2)
      this.cache.set(`mario_${id}_idle`, this.renderAscii(marioIdle, palette, 32, 32, 2));
      this.cache.set(`mario_${id}_run`, this.renderAscii(marioRun, palette, 32, 32, 2));
      this.cache.set(`mario_${id}_jump`, this.renderAscii(marioJump, palette, 32, 32, 2));

      // Also map hero_* aliases so any reference works seamlessly
      this.cache.set(`hero_${id}_idle`, this.cache.get(`mario_${id}_idle`));
      this.cache.set(`hero_${id}_run`, this.cache.get(`mario_${id}_run`));
      this.cache.set(`hero_${id}_jump`, this.cache.get(`mario_${id}_jump`));

      // 64x64 high-visibility preview canvas for the Wardrobe Shop card!
      const previewCanvas = this.renderAscii(marioIdle, palette, 64, 64, 4);
      this.previewUrls.set(id, previewCanvas.toDataURL());
    }

    // Default red and fire fallbacks
    this.cache.set('mario_idle_red', this.cache.get('mario_classic_idle'));
    this.cache.set('mario_run_red', this.cache.get('mario_classic_run'));
    this.cache.set('mario_jump_red', this.cache.get('mario_classic_jump'));

    this.cache.set('mario_idle_fire', this.cache.get('mario_fire_idle'));
    this.cache.set('mario_run_fire', this.cache.get('mario_fire_run'));
    this.cache.set('mario_jump_fire', this.cache.get('mario_fire_jump'));
  }

  /* ========================================================
     2. CLASSIC ENEMIES (Goombas & Koopas - 32x32)
     ======================================================== */
  initEnemySprites() {
    // Goomba (16x16)
    const goombaPal = {
      'B': '#92400e', // Brown body
      'D': '#451a03', // Dark brown feet
      'S': '#fef3c7', // Cream face
      'W': '#ffffff', // White eye
      'K': '#000000'  // Black pupil
    };

    const goombaWalk1 = [
      "......BBBB......",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBBBBBBBBBB..",
      ".BBBBBBBBBBBBBB.",
      ".BBBWSSWSSWBBBB.",
      "BBBBWSSWSSWBBBBB",
      "BBBBKKSSKKBBBBBB",
      "BBBBSSKKSSBBBBBB",
      ".BBSSSSSSSSBBBB.",
      "..SSSSSSSSSSSS..",
      "...SSSSSSSSSS...",
      "....SSSSSSSS....",
      ".....DDDDDD.....",
      "....DDDDDDDD....",
      "...DDDD..DDDD..."
    ];

    const goombaFlat = [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "....BBBBBBBB....",
      "..BBBBBBBBBBBB..",
      ".BBBWKKSSKKWBBBB",
      "DDSSSSSSSSSSSSDD",
      "DDDDDDDDDDDDDDDD",
      ".DDDDDDDDDDDDDD."
    ];

    this.cache.set('goomba_walk', this.renderAscii(goombaWalk1, goombaPal, 32, 32, 2));
    this.cache.set('goomba_flat', this.renderAscii(goombaFlat, goombaPal, 32, 32, 2));

    // Koopa Troopa (Green Shell)
    const koopaPal = {
      'G': '#16a34a', // Green shell
      'Y': '#facc15', // Yellow skin
      'W': '#ffffff',
      'K': '#000000',
      'O': '#ea580c'  // Shoes
    };

    const koopaWalk = [
      "......YYYY......",
      ".....YYYYYY.....",
      ".....YWYYKYY....",
      ".....YYYYYYY....",
      "......YYYY......",
      "....GGGGGGGG....",
      "...GGWWGGWWGG...",
      "..GGWWWWWWWWGG..",
      "..GGGGGGGGGGGG..",
      "..GGWWWWWWWWGG..",
      "...GGWWGGWWGG...",
      "....GGGGGGGG....",
      ".....YY..YY.....",
      "....OOO..OOO....",
      "...OOOO..OOOO...",
      "................"
    ];

    this.cache.set('koopa_walk', this.renderAscii(koopaWalk, koopaPal, 32, 32, 2));
  }

  /* ========================================================
     3. CLASSIC TILES & ITEMS (32x32)
     ======================================================== */
  initTileAndItemSprites() {
    // 1. Mystery Question Block (32x32)
    const { canvas: qCanvas, ctx: qCtx } = this.createCanvas(32, 32);
    qCtx.fillStyle = '#f59e0b';
    qCtx.fillRect(0, 0, 32, 32);
    qCtx.fillStyle = '#d97706';
    qCtx.fillRect(2, 2, 28, 28);
    qCtx.fillStyle = '#fbbf24';
    qCtx.fillRect(4, 4, 24, 24);
    // Draw Question Mark ?
    qCtx.fillStyle = '#451a03';
    qCtx.fillRect(10, 8, 12, 4);
    qCtx.fillRect(18, 12, 4, 4);
    qCtx.fillRect(14, 16, 4, 4);
    qCtx.fillRect(14, 22, 4, 4);
    // 4 Corner bolts
    qCtx.fillStyle = '#451a03';
    qCtx.fillRect(2, 2, 2, 2);
    qCtx.fillRect(28, 2, 2, 2);
    qCtx.fillRect(2, 28, 2, 2);
    qCtx.fillRect(28, 28, 2, 2);
    this.cache.set('block_question', qCanvas);

    // 2. Empty / Hit Block
    const { canvas: eCanvas, ctx: eCtx } = this.createCanvas(32, 32);
    eCtx.fillStyle = '#78350f';
    eCtx.fillRect(0, 0, 32, 32);
    eCtx.fillStyle = '#92400e';
    eCtx.fillRect(2, 2, 28, 28);
    eCtx.fillStyle = '#5c2205';
    eCtx.fillRect(2, 2, 2, 2);
    eCtx.fillRect(28, 2, 2, 2);
    eCtx.fillRect(2, 28, 2, 2);
    eCtx.fillRect(28, 28, 2, 2);
    this.cache.set('block_empty', eCanvas);

    // 3. Brick Block
    const { canvas: bCanvas, ctx: bCtx } = this.createCanvas(32, 32);
    bCtx.fillStyle = '#000000';
    bCtx.fillRect(0, 0, 32, 32);
    bCtx.fillStyle = '#b45309';
    bCtx.fillRect(2, 2, 13, 13);
    bCtx.fillRect(17, 2, 13, 13);
    bCtx.fillRect(2, 17, 6, 13);
    bCtx.fillRect(10, 17, 12, 13);
    bCtx.fillRect(24, 17, 6, 13);
    this.cache.set('block_brick', bCanvas);

    // 4. Ground Grass Block
    const { canvas: gCanvas, ctx: gCtx } = this.createCanvas(32, 32);
    gCtx.fillStyle = '#854d0e';
    gCtx.fillRect(0, 0, 32, 32);
    // Green grassy top
    gCtx.fillStyle = '#16a34a';
    gCtx.fillRect(0, 0, 32, 8);
    gCtx.fillStyle = '#22c55e';
    gCtx.fillRect(0, 0, 32, 4);
    // Grass hanging tufts
    gCtx.fillStyle = '#16a34a';
    for (let x = 2; x < 32; x += 6) {
      gCtx.fillRect(x, 8, 3, 3);
    }
    this.cache.set('tile_ground', gCanvas);

    // 5. Pipe
    const { canvas: pTop, ctx: ptCtx } = this.createCanvas(64, 32);
    ptCtx.fillStyle = '#15803d';
    ptCtx.fillRect(0, 0, 64, 32);
    ptCtx.fillStyle = '#22c55e';
    ptCtx.fillRect(4, 2, 12, 28);
    ptCtx.fillStyle = '#14532d';
    ptCtx.fillRect(52, 2, 10, 28);
    this.cache.set('pipe_top', pTop);

    const { canvas: pBody, ctx: pbCtx } = this.createCanvas(56, 32);
    pbCtx.fillStyle = '#15803d';
    pbCtx.fillRect(0, 0, 56, 32);
    pbCtx.fillStyle = '#22c55e';
    pbCtx.fillRect(4, 0, 10, 32);
    pbCtx.fillStyle = '#14532d';
    pbCtx.fillRect(44, 0, 10, 32);
    this.cache.set('pipe_body', pBody);

    // 6. Super Mushroom
    const mushroomPal = {
      'R': '#e52521',
      'W': '#ffffff',
      'S': '#fde68a',
      'K': '#000000'
    };
    const mushroomMap = [
      "......RRRR......",
      "....RRRRRRRR....",
      "...RRWWWRRRRR...",
      "..RRWWWWWRRRRR..",
      "..RWWWWWWWRRRR..",
      ".RRWWWWWWWRRRRR.",
      ".RRWWWWWWWRRRRR.",
      ".RRRWWWWWRRRRRR.",
      "..RRRRRRRRRRRR..",
      "...SSSSSSSSSS...",
      "...SSKSSSSKSS...",
      "...SSKSSSSKSS...",
      "...SSSSSSSSSS...",
      "....SSSSSSSS....",
      "................",
      "................"
    ];
    this.cache.set('item_mushroom', this.renderAscii(mushroomMap, mushroomPal, 28, 28, 1.75));

    // 7. Energy Bar / Survival Food
    const { canvas: fCanvas, ctx: fCtx } = this.createCanvas(24, 24);
    fCtx.fillStyle = '#06b6d4';
    fCtx.fillRect(2, 4, 20, 16);
    fCtx.fillStyle = '#22d3ee';
    fCtx.fillRect(4, 6, 16, 12);
    fCtx.fillStyle = '#facc15';
    fCtx.beginPath();
    fCtx.moveTo(13, 7);
    fCtx.lineTo(9, 13);
    fCtx.lineTo(13, 13);
    fCtx.lineTo(11, 18);
    fCtx.lineTo(16, 11);
    fCtx.lineTo(12, 11);
    fCtx.closePath();
    fCtx.fill();
    this.cache.set('item_energy_bar', fCanvas);

    // 8. Fire Flower
    const flowerPal = {
      'R': '#ef4444',
      'O': '#f97316',
      'Y': '#facc15',
      'G': '#16a34a',
      'W': '#ffffff',
      'K': '#000000'
    };
    const flowerMap = [
      ".....RRRRRR.....",
      "....RROOOORR....",
      "...RROYYYYORR...",
      "..RROYYWWYYORR..",
      "..RROYYKKYYORR..",
      "..RROYYWWYYORR..",
      "...RROYYYYORR...",
      "....RROOOORR....",
      ".....RRRRRR.....",
      ".......GG.......",
      "....GGGGGGGG....",
      "....GG.GG.GG....",
      ".......GG.......",
      ".......GG.......",
      "................",
      "................"
    ];
    this.cache.set('item_fireflower', this.renderAscii(flowerMap, flowerPal, 28, 28, 1.75));

    // 9. Coin
    const coinPal = {
      'Y': '#f59e0b',
      'G': '#fbbf24',
      'W': '#ffffff',
      'K': '#78350f'
    };
    const coinMap = [
      "......YYYY......",
      "....YYGGGGYY....",
      "...YGGWWWWGGY...",
      "..YGGWKKKKGGGY..",
      ".YGGGKKKKKKGGGY.",
      ".YGGGKKKKKKGGGY.",
      ".YGGGKKKKKKGGGY.",
      ".YGGGKKKKKKGGGY.",
      "..YGGWKKKKGGGY..",
      "...YGGWWWWGGY...",
      "....YYGGGGYY....",
      "......YYYY......"
    ];
    this.cache.set('coin', this.renderAscii(coinMap, coinPal, 24, 24, 2.0));

    // 10. Fireball Projectile
    const { canvas: fbCanvas, ctx: fbCtx } = this.createCanvas(16, 16);
    const grad = fbCtx.createRadialGradient(8, 8, 2, 8, 8, 8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#facc15');
    grad.addColorStop(0.7, '#f97316');
    grad.addColorStop(1, '#ef4444');
    fbCtx.fillStyle = grad;
    fbCtx.beginPath();
    fbCtx.arc(8, 8, 7, 0, Math.PI * 2);
    fbCtx.fill();
    this.cache.set('projectile_fireball', fbCanvas);

    // 11. Goal Flag
    const { canvas: flagCanvas, ctx: flagCtx } = this.createCanvas(48, 48);
    flagCtx.fillStyle = '#22c55e';
    flagCtx.beginPath();
    flagCtx.moveTo(4, 4);
    flagCtx.lineTo(36, 18);
    flagCtx.lineTo(4, 32);
    flagCtx.closePath();
    flagCtx.fill();
    flagCtx.fillStyle = '#15803d';
    flagCtx.fillRect(4, 4, 3, 28);
    this.cache.set('goal_flag', flagCanvas);
  }

  renderAscii(map, palette, width, height, pixelSize) {
    const { canvas, ctx } = this.createCanvas(width, height);
    this.drawAsciiGrid(ctx, map, palette, pixelSize, 0, 0);
    return canvas;
  }

  get(key) {
    return this.cache.get(key) || null;
  }

  getCostumePreview(costumeId) {
    return this.previewUrls.get(costumeId) || this.previewUrls.get('classic');
  }
}

export const spriteFactory = new SpriteFactory();
export default spriteFactory;
