import { TILE_TYPES } from '../engine/TileMap';

export const createLevel1 = () => {
  const rows = 15;
  const cols = 125;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(TILE_TYPES.EMPTY));

  // 1. Base Ground (Row 13 & 14) with strategic pitfalls
  for (let c = 0; c < cols; c++) {
    // Pitfall gaps at 32-35, 68-71, 92-94
    if ((c >= 32 && c <= 35) || (c >= 68 && c <= 71) || (c >= 92 && c <= 94)) {
      continue;
    }
    matrix[13][c] = TILE_TYPES.GROUND;
    matrix[14][c] = TILE_TYPES.GROUND;
  }

  // 2. Helper to add pipe
  const addPipe = (col, height) => {
    const topRow = 13 - height;
    matrix[topRow][col] = TILE_TYPES.PIPE_TOP_L;
    matrix[topRow][col + 1] = TILE_TYPES.PIPE_TOP_R;
    for (let r = topRow + 1; r < 13; r++) {
      matrix[r][col] = TILE_TYPES.PIPE_BODY_L;
      matrix[r][col + 1] = TILE_TYPES.PIPE_BODY_R;
    }
  };

  addPipe(16, 2);
  addPipe(28, 3);
  addPipe(52, 2);
  addPipe(78, 3);
  addPipe(98, 2);

  // 3. Question Blocks and Bricks
  // Early area (Mushroom & Coins)
  matrix[9][10] = TILE_TYPES.QUESTION;
  matrix[9][11] = TILE_TYPES.BRICK;
  matrix[9][12] = TILE_TYPES.QUESTION;
  matrix[9][13] = TILE_TYPES.BRICK;
  matrix[9][14] = TILE_TYPES.QUESTION;

  // High secret platform (Row 5)
  matrix[5][12] = TILE_TYPES.QUESTION;

  // Mid-area platform across first pit (cols 22-26)
  for (let c = 22; c <= 26; c++) {
    matrix[9][c] = TILE_TYPES.BRICK;
  }
  matrix[9][24] = TILE_TYPES.QUESTION;

  // Food & Energy Bar cache before second pit (col 40-48)
  matrix[9][42] = TILE_TYPES.QUESTION;
  matrix[9][43] = TILE_TYPES.BRICK;
  matrix[9][44] = TILE_TYPES.QUESTION;
  matrix[9][45] = TILE_TYPES.BRICK;
  matrix[9][46] = TILE_TYPES.QUESTION;

  // Floating stepping stones across pit 2 (col 68-72)
  matrix[10][68] = TILE_TYPES.BRICK;
  matrix[8][70] = TILE_TYPES.BRICK;
  matrix[10][72] = TILE_TYPES.BRICK;

  // Fire Flower area (col 82-88)
  matrix[9][84] = TILE_TYPES.BRICK;
  matrix[9][85] = TILE_TYPES.QUESTION;
  matrix[9][86] = TILE_TYPES.BRICK;
  matrix[6][85] = TILE_TYPES.QUESTION;

  // Pyramid steps before goal (col 102-108)
  for (let step = 1; step <= 5; step++) {
    const col = 101 + step;
    for (let r = 13 - step; r < 13; r++) {
      matrix[r][col] = TILE_TYPES.GROUND;
    }
  }

  // Goal Flag Pole (col 114)
  matrix[2][114] = TILE_TYPES.FLAG_TOP;
  for (let r = 3; r <= 12; r++) {
    matrix[r][114] = TILE_TYPES.FLAG_POLE;
  }
  // Castle base at col 118-122
  for (let c = 118; c <= 122; c++) {
    for (let r = 9; r < 13; r++) {
      matrix[r][c] = TILE_TYPES.BRICK;
    }
  }

  // Spikes hazards
  matrix[12][31] = TILE_TYPES.SPIKE;
  matrix[12][67] = TILE_TYPES.SPIKE;

  // Item mapping for Question Blocks: "r,c" -> type
  const itemSpawns = {
    '9,10': 'coin',
    '9,12': 'mushroom',    // Super Mushroom
    '9,14': 'energy',      // Energy Bar (Stamina ration)
    '5,12': 'coin',
    '9,24': 'energy',      // Extra food before long stretch
    '9,42': 'mushroom',
    '9,44': 'energy',
    '9,46': 'coin',
    '9,85': 'fireflower',  // Fire Flower
    '6,85': 'energy'
  };

  // Enemies spawn list
  const enemySpawns = [
    { x: 380, y: 380, type: 'goomba' },
    { x: 620, y: 380, type: 'goomba' },
    { x: 800, y: 380, type: 'goomba' },
    { x: 1100, y: 380, type: 'koopa' },
    { x: 1450, y: 380, type: 'goomba' },
    { x: 1600, y: 380, type: 'goomba' },
    { x: 1900, y: 380, type: 'koopa' },
    { x: 2300, y: 380, type: 'goomba' },
    { x: 2600, y: 380, type: 'koopa' },
    { x: 3000, y: 380, type: 'goomba' }
  ];

  // Plentiful Floating Collectible Coins (Arcs & Rows!)
  const coins = [
    // Intro coin arc
    { x: 220, y: 340 }, { x: 250, y: 310 }, { x: 280, y: 290 }, { x: 310, y: 310 }, { x: 340, y: 340 },
    // Above first pipe
    { x: 512, y: 270 }, { x: 536, y: 270 },
    // Platform coins (cols 22-26)
    { x: 710, y: 240 }, { x: 740, y: 240 }, { x: 770, y: 240 }, { x: 800, y: 240 },
    // Pipe 2 coins
    { x: 900, y: 230 }, { x: 924, y: 230 },
    // Floating over pit 1
    { x: 1060, y: 330 }, { x: 1090, y: 300 }, { x: 1120, y: 330 },
    // Cache row (cols 40-48)
    { x: 1300, y: 240 }, { x: 1340, y: 240 }, { x: 1380, y: 240 }, { x: 1420, y: 240 }, { x: 1460, y: 240 },
    // Stepping stones coin chain (pit 2)
    { x: 2180, y: 270 }, { x: 2240, y: 210 }, { x: 2300, y: 270 },
    // High sky coins (col 85)
    { x: 2680, y: 150 }, { x: 2720, y: 150 }, { x: 2760, y: 150 },
    // Staircase coins
    { x: 3300, y: 280 }, { x: 3340, y: 240 }, { x: 3380, y: 200 }, { x: 3420, y: 160 }
  ];

  return {
    levelId: 1,
    name: 'Verdant Plains',
    theme: 'grassland',
    matrix,
    itemSpawns,
    enemySpawns,
    coins,
    flagCol: 114,
    timeLimit: 150,
    targetScore: 6000
  };
};

export default createLevel1;
