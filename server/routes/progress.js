const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { getDBStatus, memoryStore } = require('../config/db');
const { authMiddleware } = require('./auth');

// GET /api/progress/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { connected } = getDBStatus();

    if (connected) {
      let prog = await Progress.findOne({ userId });
      if (!prog) {
        return res.json({
          success: true,
          progress: {
            userId,
            currentLevel: 1,
            levelsCompleted: [],
            health: 3,
            hunger: 100,
            inventory: [],
            totalScore: 0,
            coins: 0
          }
        });
      }
      return res.json({ success: true, progress: prog });
    } else {
      let prog = memoryStore.progress.find(p => p.userId === userId);
      if (!prog) {
        prog = {
          userId,
          currentLevel: 1,
          levelsCompleted: [],
          health: 3,
          hunger: 100,
          inventory: [],
          totalScore: 0,
          coins: 0
        };
      }
      return res.json({ success: true, progress: prog });
    }
  } catch (err) {
    console.error('Fetch progress error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve progress' });
  }
});

// POST /api/progress/:userId
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, currentLevel, levelsCompleted, health, hunger, inventory, totalScore, coins } = req.body;
    const { connected } = getDBStatus();

    if (connected) {
      let prog = await Progress.findOne({ userId });
      if (!prog) {
        prog = new Progress({
          userId,
          username: username || 'Player',
          currentLevel: currentLevel || 1,
          levelsCompleted: levelsCompleted || [],
          health: health ?? 3,
          hunger: hunger ?? 100,
          inventory: inventory || [],
          totalScore: totalScore || 0,
          coins: coins || 0
        });
      } else {
        if (currentLevel !== undefined) prog.currentLevel = currentLevel;
        if (levelsCompleted) prog.levelsCompleted = Array.from(new Set([...prog.levelsCompleted, ...levelsCompleted]));
        if (health !== undefined) prog.health = health;
        if (hunger !== undefined) prog.hunger = hunger;
        if (inventory !== undefined) prog.inventory = inventory;
        if (totalScore !== undefined) prog.totalScore = Math.max(prog.totalScore, totalScore);
        if (coins !== undefined) prog.coins = coins;
        prog.updatedAt = new Date();
      }
      await prog.save();
      return res.json({ success: true, progress: prog });
    } else {
      let idx = memoryStore.progress.findIndex(p => p.userId === userId);
      let data = {
        userId,
        username: username || 'Player',
        currentLevel: currentLevel || 1,
        levelsCompleted: levelsCompleted || [],
        health: health ?? 3,
        hunger: hunger ?? 100,
        inventory: inventory || [],
        totalScore: totalScore || 0,
        coins: coins || 0,
        updatedAt: new Date()
      };
      if (idx >= 0) {
        memoryStore.progress[idx] = { ...memoryStore.progress[idx], ...data };
      } else {
        memoryStore.progress.push(data);
      }
      return res.json({ success: true, progress: data });
    }
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ success: false, message: 'Failed to save progress' });
  }
});

module.exports = router;
