const express = require('express');
const router = express.Router();

const LEVELS_METADATA = [
  {
    id: 1,
    title: 'World 1-1: Mushroom Plains',
    theme: 'overworld',
    difficulty: 'Normal',
    parTime: 120,
    targetScore: 5000,
    description: 'Vibrant hills filled with mystery blocks, jumping pipes, Goombas, and vital energy bars.',
    hazards: ['Pitfalls', 'Spikes', 'Patrol Goombas'],
    powerups: ['Super Mushroom', 'Energy Bar', 'Fire Flower']
  },
  {
    id: 2,
    title: 'World 1-2: Cavern Depths',
    theme: 'underground',
    difficulty: 'Hard',
    parTime: 100,
    targetScore: 7500,
    description: 'Dark subterranean caves with leaping Koopas, low ceilings, and tight platforming.',
    hazards: ['Falling Rocks', 'Acid Pools', 'Koopa Troopas'],
    powerups: ['Fire Flower', 'Invincibility Star']
  }
];

// GET /api/levels
router.get('/', (req, res) => {
  res.json({ success: true, levels: LEVELS_METADATA });
});

// GET /api/levels/:id
router.get('/:id', (req, res) => {
  const level = LEVELS_METADATA.find(l => l.id === Number(req.params.id));
  if (!level) {
    return res.status(404).json({ success: false, message: 'Level not found' });
  }
  res.json({ success: true, level });
});

module.exports = router;
