import { TILE_TYPES } from '../engine/TileMap';

export const createLevel3 = () => {
  const rows = 15;
  const cols = 140;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(TILE_TYPES.EMPTY));

  // 1. Sky Citadel: Broken Floating Islands over Sky Abyss
  for (let c = 0; c < cols; c++) {
    // Large cloud-sky chasms: 18-23, 45-52, 75-82, 105-110
    if (
      (c >= 18 && c <= 23) ||
      (c >= 45 && c <= 52) ||
      (c >= 75 && c <= 82) ||
      (c >= 105 && c <= 110)
    ) {
      continue;
    }
    matrix[13][c] = TILE_TYPES.GROUND;
    matrix[14][c] = TILE_TYPES.GROUND;
  }

  // Helper to add castle towers / pipes
  const addPipe = (col, height) => {
    const topRow = 13 - height;
    matrix[topRow][col] = TILE_TYPES.PIPE_TOP_L;
    matrix[topRow][col + 1] = TILE_TYPES.PIPE_TOP_R;
    for (let r = topRow + 1; r < 13; r++) {
      matrix[r][col] = TILE_TYPES.PIPE_BODY_L;
      matrix[r][col + 1] = TILE_TYPES.PIPE_BODY_R;
    }
  };

  addPipe(12, 2);
  addPipe(35, 3);
  addPipe(65, 3);
  addPipe(95, 2);

  // 2. High-Altitude Brick Sky Bridges
  // Bridge 1 over Abyss 1 (cols 18-24)
  matrix[9][19] = TILE_TYPES.BRICK;
  matrix[9][20] = TILE_TYPES.QUESTION;
  matrix[9][21] = TILE_TYPES.BRICK;
  matrix[9][22] = TILE_TYPES.BRICK;

  // Sky Cloud Platform (Row 6, cols 28-36)
  for (let c = 28; c <= 36; c++) {
    matrix[6][c] = TILE_TYPES.BRICK;
  }
  matrix[6][32] = TILE_TYPES.QUESTION;

  // High stepping bridge over Abyss 2 (cols 45-53)
  matrix[10][46] = TILE_TYPES.BRICK;
  matrix[8][48] = TILE_TYPES.QUESTION;
  matrix[6][50] = TILE_TYPES.BRICK;
  matrix[9][52] = TILE_TYPES.BRICK;

  // Mid Fortress Challenge (cols 58-66)
  matrix[9][59] = TILE_TYPES.BRICK;
  matrix[9][60] = TILE_TYPES.QUESTION;
  matrix[9][61] = TILE_TYPES.BRICK;
  matrix[9][62] = TILE_TYPES.QUESTION;
  matrix[9][63] = TILE_TYPES.BRICK;

  // Flying Island Bridge over Abyss 3 (cols 74-83)
  for (let c = 76; c <= 81; c++) {
    matrix[8][c] = TILE_TYPES.BRICK;
  }
  matrix[8][78] = TILE_TYPES.QUESTION;
  matrix[4][78] = TILE_TYPES.QUESTION; // High Fire Flower

  // Double tier platforms (cols 86-96)
  for (let c = 88; c <= 94; c++) {
    matrix[9][c] = TILE_TYPES.BRICK;
    matrix[5][c] = TILE_TYPES.BRICK;
  }
  matrix[5][91] = TILE_TYPES.QUESTION;

  // Final Cloud Stepping stones over Abyss 4 (cols 104-111)
  matrix[10][105] = TILE_TYPES.BRICK;
  matrix[8][107] = TILE_TYPES.BRICK;
  matrix[7][109] = TILE_TYPES.BRICK;

  // Grand Fortress Pyramid Stairs (cols 115-123)
  for (let step = 1; step <= 7; step++) {
    const col = 114 + step;
    for (let r = 13 - step; r < 13; r++) {
      matrix[r][col] = TILE_TYPES.GROUND;
    }
  }

  // Grand Goal Flag Pole (col 128)
  matrix[2][128] = TILE_TYPES.FLAG_TOP;
  for (let r = 3; r <= 12; r++) {
    matrix[r][128] = TILE_TYPES.FLAG_POLE;
  }
  // Royal Castle Fortress (cols 132-138)
  for (let c = 132; c <= 138; c++) {
    for (let r = 7; r < 13; r++) {
      matrix[r][c] = TILE_TYPES.BRICK;
    }
  }

  // Hazard Spikes
  matrix[12][17] = TILE_TYPES.SPIKE;
  matrix[12][44] = TILE_TYPES.SPIKE;
  matrix[12][74] = TILE_TYPES.SPIKE;
  matrix[12][104] = TILE_TYPES.SPIKE;

  // Item mapping for Question Blocks
  const itemSpawns = {
    '9,20': 'energy',
    '6,32': 'mushroom',
    '8,48': 'energy',
    '9,60': 'coin',
    '9,62': 'mushroom',
    '8,78': 'energy',
    '4,78': 'fireflower', // Super weapon for the fortress!
    '5,91': 'energy'
  };

  // Enemies spawn list
  const enemySpawns = [
    { x: 300, y: 380, type: 'goomba' },
    { x: 450, y: 380, type: 'koopa' },
    { x: 920, y: 160, type: 'koopa' }, // on sky cloud
    { x: 1040, y: 160, type: 'goomba' },
    { x: 1350, y: 380, type: 'goomba' },
    { x: 1600, y: 240, type: 'koopa' },
    { x: 1900, y: 380, type: 'goomba' },
    { x: 2100, y: 380, type: 'koopa' },
    { x: 2450, y: 210, type: 'koopa' }, // on flying island
    { x: 2750, y: 380, type: 'goomba' },
    { x: 2950, y: 120, type: 'goomba' },
    { x: 3300, y: 380, type: 'koopa' },
    { x: 3600, y: 380, type: 'goomba' }
  ];

  // Plentiful Sky Coins!
  const coins = [
    // Entrance arches
    { x: 180, y: 340 }, { x: 210, y: 300 }, { x: 240, y: 300 }, { x: 270, y: 340 },
    // Bridge 1 coins (cols 18-24)
    { x: 600, y: 240 }, { x: 630, y: 240 }, { x: 660, y: 240 }, { x: 690, y: 240 },
    // Cloud island coins (cols 28-36)
    { x: 900, y: 150 }, { x: 940, y: 150 }, { x: 980, y: 150 }, { x: 1020, y: 150 }, { x: 1060, y: 150 },
    // Stepping stones over Abyss 2
    { x: 1470, y: 270 }, { x: 1530, y: 210 }, { x: 1600, y: 150 }, { x: 1660, y: 240 },
    // Challenge row (cols 58-66)
    { x: 1880, y: 240 }, { x: 1920, y: 240 }, { x: 1960, y: 240 }, { x: 2000, y: 240 },
    // Sky island high vault
    { x: 2430, y: 200 }, { x: 2470, y: 200 }, { x: 2510, y: 200 }, { x: 2550, y: 200 },
    // High secret tier (cols 88-94)
    { x: 2820, y: 120 }, { x: 2860, y: 120 }, { x: 2900, y: 120 }, { x: 2940, y: 120 },
    // Stepping stones over Abyss 4
    { x: 3350, y: 280 }, { x: 3420, y: 210 }, { x: 3490, y: 180 },
    // Staircase finish to grand victory
    { x: 3700, y: 280 }, { x: 3740, y: 240 }, { x: 3780, y: 200 }, { x: 3820, y: 160 }, { x: 3860, y: 120 }
  ];

  return {
    levelId: 3,
    name: 'Sky Citadel',
    theme: 'citadel',
    matrix,
    itemSpawns,
    enemySpawns,
    coins,
    flagCol: 128,
    timeLimit: 140,
    targetScore: 12000
  };
};

export default createLevel3;
