const mongoose = require('mongoose');

let isConnected = false;
let memoryStore = {
  users: [],
  progress: [],
  scores: [
    { _id: '1', username: 'RetroSpeedster', score: 12500, timeElapsed: 74, levelId: 1, createdAt: new Date(Date.now() - 86400000) },
    { _id: '2', username: 'PixelMaster', score: 9800, timeElapsed: 89, levelId: 1, createdAt: new Date(Date.now() - 172800000) },
    { _id: '3', username: 'SurvivalPro', score: 8400, timeElapsed: 110, levelId: 1, createdAt: new Date(Date.now() - 259200000) },
    { _id: '4', username: 'MarioFan99', score: 6200, timeElapsed: 135, levelId: 1, createdAt: new Date(Date.now() - 345600000) }
  ]
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mario_survival';
  try {
    // Attempt fast connection timeout of 3s to not hang on machines without Mongo
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${uri}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Could not connect to MongoDB daemon (${err.message}). Activating in-memory persistence fallback for frictionless local gameplay.`);
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  type: isConnected ? 'mongodb' : 'in-memory-fallback'
});

module.exports = {
  connectDB,
  getDBStatus,
  memoryStore
};
