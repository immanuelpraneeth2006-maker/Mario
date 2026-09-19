const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus, memoryStore } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'retro_mario_survival_secret_key_2026';

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
    }
    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const { connected } = getDBStatus();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (connected) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }

      const newUser = new User({ username, passwordHash, email });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        success: true,
        token,
        user: { id: newUser._id, username: newUser.username, email: newUser.email, highScore: newUser.highScore }
      });
    } else {
      // Memory Store Fallback
      const existing = memoryStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }

      const fakeId = 'user_' + Date.now();
      const user = { _id: fakeId, username, passwordHash, email: email || '', highScore: 0, createdAt: new Date() };
      memoryStore.users.push(user);

      const token = jwt.sign({ id: fakeId, username }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        success: true,
        token,
        user: { id: fakeId, username, email: user.email, highScore: 0 }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        token,
        user: { id: user._id, username: user.username, email: user.email, highScore: user.highScore }
      });
    } else {
      // Memory fallback
      const user = memoryStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        token,
        user: { id: user._id, username: user.username, email: user.email, highScore: user.highScore }
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { connected } = getDBStatus();
    if (connected) {
      const user = await User.findById(req.user.id).select('-passwordHash');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    } else {
      const user = memoryStore.users.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { passwordHash, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
});

module.exports = {
  router,
  authMiddleware
};
