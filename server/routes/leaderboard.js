const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const { getDBStatus, memoryStore } = require('../config/db');

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const { levelId, limit = 10 } = req.query;
    const { connected } = getDBStatus();

    if (connected) {
      const query = levelId ? { levelId: Number(levelId) } : {};
      const scores = await Score.find(query)
        .sort({ score: -1, timeElapsed: 1 })
        .limit(Number(limit))
        .lean();

      return res.json({ success: true, scores });
    } else {
      let scores = [...memoryStore.scores];
      if (levelId) {
        scores = scores.filter(s => s.levelId === Number(levelId));
      }
      scores.sort((a, b) => b.score - a.score || (a.timeElapsed || 0) - (b.timeElapsed || 0));
      return res.json({ success: true, scores: scores.slice(0, Number(limit)) });
    }
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// POST /api/leaderboard
router.post('/', async (req, res) => {
  try {
    const { username, score, timeElapsed, coinsCollected, levelId, userId } = req.body;
    if (!username || score === undefined) {
      return res.status(400).json({ success: false, message: 'Username and score are required' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const newScore = new Score({
        userId,
        username: username.trim(),
        score: Number(score),
        timeElapsed: Number(timeElapsed || 0),
        coinsCollected: Number(coinsCollected || 0),
        levelId: Number(levelId || 1)
      });
      await newScore.save();
      return res.status(201).json({ success: true, score: newScore });
    } else {
      const newScore = {
        _id: 'score_' + Date.now(),
        userId,
        username: username.trim(),
        score: Number(score),
        timeElapsed: Number(timeElapsed || 0),
        coinsCollected: Number(coinsCollected || 0),
        levelId: Number(levelId || 1),
        createdAt: new Date()
      };
      memoryStore.scores.push(newScore);
      return res.status(201).json({ success: true, score: newScore });
    }
  } catch (err) {
    console.error('Submit score error:', err);
    res.status(500).json({ success: false, message: 'Failed to save score' });
  }
});

module.exports = router;
