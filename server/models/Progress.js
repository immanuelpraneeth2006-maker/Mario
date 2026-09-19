const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  currentLevel: { 
    type: Number, 
    default: 1 
  },
  levelsCompleted: { 
    type: [Number], 
    default: [] 
  },
  health: { 
    type: Number, 
    default: 3 
  },
  hunger: { 
    type: Number, 
    default: 100 
  },
  inventory: { 
    type: [String], 
    default: [] 
  },
  totalScore: { 
    type: Number, 
    default: 0 
  },
  coins: { 
    type: Number, 
    default: 0 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);
