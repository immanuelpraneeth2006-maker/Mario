import { TILE_TYPES } from '../engine/TileMap';

export const createLevel2 = () => {
  const rows = 15;
  const cols = 135;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(TILE_TYPES.EMPTY));

  // 1. Underground Cave Ground with Lava Chasms
  for (let c = 0; c < cols; c++) {
    // Chasm pits at 25-29, 58-63, 88-92
    if ((c >= 25 && c <= 29) || (c >= 58 && c <= 63) || (c >= 88 && c <= 92)) {
      continue;
    }
    matrix[13][c] = TILE_TYPES.GROUND;
    matrix[14][c] = TILE_TYPES.GROUND;
  }

  // 2. Cavern Ceiling (Row 0 & 1) with hanging stalactites / spike hazards
  for (let c = 0; c < cols; c++) {
    if (c % 12 === 0 && c < 120) {
      matrix[2][c] = TILE_TYPES.SPIKE;
    }
  }

  // Helper for pipe obstacles
  const addPipe = (col, height) => {
    const topRow = 13 - height;
    matrix[topRow][col] = TILE_TYPES.PIPE_TOP_L;
    matrix[topRow][col + 1] = TILE_TYPES.PIPE_TOP_R;
    for (let r = topRow + 1; r < 13; r++) {
      matrix[r][col] = TILE_TYPES.PIPE_BODY_L;
      matrix[r][col + 1] = TILE_TYPES.PIPE_BODY_R;
    }
  };

  addPipe(18, 2);
  addPipe(42, 3);
  addPipe(72, 2);
  addPipe(98, 3);

  // 3. Multi-tier Cavern Platforms
  // Tier 1: Crystal ledge (cols 8-16)
  for (let c = 8; c <= 16; c++) {
    matrix[9][c] = TILE_TYPES.BRICK;
  }
  matrix[9][12] = TILE_TYPES.QUESTION;

  // Ledge across Pit 1 (cols 24-30)
  matrix[10][25] = TILE_TYPES.BRICK;
  matrix[8][27] = TILE_TYPES.QUESTION;
  matrix[10][29] = TILE_TYPES.BRICK;

  // High Cavern Rail (Row 6, cols 34-45)
  for (let c = 34; c <= 45; c++) {
    matrix[6][c] = TILE_TYPES.BRICK;
  }
  matrix[6][38] = TILE_TYPES.QUESTION;
  matrix[6][41] = TILE_TYPES.QUESTION;

  // Mid-cavern challenge blocks (cols 50-56)
  matrix[9][51] = TILE_TYPES.BRICK;
  matrix[9][52] = TILE_TYPES.QUESTION;
  matrix[9][53] = TILE_TYPES.BRICK;
  matrix[9][54] = TILE_TYPES.QUESTION;
  matrix[9][55] = TILE_TYPES.BRICK;

  // Stepping stones over giant Chasm 2 (cols 58-64)
  matrix[11][59] = TILE_TYPES.BRICK;
  matrix[8][61] = TILE_TYPES.BRICK;
  matrix[10][63] = TILE_TYPES.BRICK;

  // Fire Flower cache (cols 76-84)
  for (let c = 78; c <= 82; c++) {
    matrix[9][c] = TILE_TYPES.BRICK;
  }
  matrix[9][80] = TILE_TYPES.QUESTION;
  matrix[5][80] = TILE_TYPES.QUESTION;

  // Platform over Pit 3 (cols 87-93)
  matrix[9][89] = TILE_TYPES.BRICK;
  matrix[9][91] = TILE_TYPES.BRICK;

  // Pyramid before goal (cols 108-115)
  for (let step = 1; step <= 6; step++) {
    const col = 107 + step;
    for (let r = 13 - step; r < 13; r++) {
      matrix[r][col] = TILE_TYPES.GROUND;
    }
  }

  // Goal Flag (col 122)
  matrix[2][122] = TILE_TYPES.FLAG_TOP;
  for (let r = 3; r <= 12; r++) {
    matrix[r][122] = TILE_TYPES.FLAG_POLE;
  }
  for (let c = 126; c <= 130; c++) {
    for (let r = 9; r < 13; r++) {
      matrix[r][c] = TILE_TYPES.BRICK;
    }
  }

  // Spikes hazards on floor
  matrix[12][24] = TILE_TYPES.SPIKE;
  matrix[12][57] = TILE_TYPES.SPIKE;
  matrix[12][87] = TILE_TYPES.SPIKE;

  // Item mapping for Question Blocks
  const itemSpawns = {
    '9,12': 'energy',      // Food stamina ration
    '8,27': 'mushroom',    // Super Mushroom
    '6,38': 'coin',
    '6,41': 'energy',
    '9,52': 'mushroom',
    '9,54': 'coin',
    '9,80': 'fireflower',  // Fire Flower
    '5,80': 'energy'
  };

  // Enemies spawn list
  const enemySpawns = [
    { x: 300, y: 380, type: 'goomba' },
    { x: 500, y: 380, type: 'goomba' },
    { x: 800, y: 380, type: 'koopa' },
    { x: 1100, y: 160, type: 'goomba' }, // on high rail
    { x: 1300, y: 160, type: 'goomba' },
    { x: 1550, y: 380, type: 'koopa' },
    { x: 1800, y: 380, type: 'goomba' },
    { x: 2100, y: 380, type: 'koopa' },
    { x: 2450, y: 380, type: 'goomba' },
    { x: 2800, y: 380, type: 'koopa' },
    { x: 3200, y: 380, type: 'goomba' }
  ];

  // Plentiful Crystal Cavern Coins!
  const coins = [
    // Entrance curve
    { x: 180, y: 340 }, { x: 210, y: 310 }, { x: 240, y: 310 }, { x: 270, y: 340 },
    // Platform 1 coins
    { x: 320, y: 240 }, { x: 360, y: 240 }, { x: 400, y: 240 }, { x: 440, y: 240 },
    // Across pit 1
    { x: 830, y: 260 }, { x: 864, y: 210 }, { x: 898, y: 260 },
    // High Cavern Rail coin highway (cols 34-45)
    { x: 1120, y: 150 }, { x: 1160, y: 150 }, { x: 1200, y: 150 }, { x: 1240, y: 150 }, { x: 1280, y: 150 },
    { x: 1320, y: 150 }, { x: 1360, y: 150 }, { x: 1400, y: 150 },
    // Stepping stones over pit 2
    { x: 1880, y: 300 }, { x: 1950, y: 210 }, { x: 2020, y: 270 },
    // Mid cavern arches
    { x: 2200, y: 340 }, { x: 2230, y: 310 }, { x: 2260, y: 310 }, { x: 2290, y: 340 },
    // Secret upper cavern coin vault (above col 80)
    { x: 2520, y: 120 }, { x: 2560, y: 120 }, { x: 2600, y: 120 },
    // Pit 3 coins
    { x: 2820, y: 250 }, { x: 2880, y: 250 }, { x: 2940, y: 250 },
    // Staircase finish
    { x: 3500, y: 260 }, { x: 3540, y: 220 }, { x: 3580, y: 180 }, { x: 3620, y: 140 }
  ];

  return {
    levelId: 2,
    name: 'Crystal Caverns',
    theme: 'cavern',
    matrix,
    itemSpawns,
    enemySpawns,
    coins,
    flagCol: 122,
    timeLimit: 140,
    targetScore: 9000
  };
};

export default createLevel2;
