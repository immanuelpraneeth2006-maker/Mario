const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  username: { 
    type: String, 
    required: true,
    trim: true
  },
  score: { 
    type: Number, 
    required: true 
  },
  timeElapsed: {
    type: Number, // in seconds
    default: 0
  },
  coinsCollected: {
    type: Number,
    default: 0
  },
  levelId: { 
    type: Number, 
    default: 1 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Score', ScoreSchema);
