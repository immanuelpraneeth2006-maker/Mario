const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB, getDBStatus } = require('./config/db');
const { router: authRoutes } = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');
const levelsRoutes = require('./routes/levels');
const setupGameSocket = require('./sockets/gameSocket');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/levels', levelsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: getDBStatus()
  });
});

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup real-time socket events
setupGameSocket(io);

// Start server helper
const startServer = (port = PORT) => {
  return new Promise((resolve) => {
    const s = server.listen(port, () => {
      console.log(`[Server] Mario Survival Platformer server running on port ${port}`);
      console.log(`[Server] Health check: http://localhost:${port}/api/health`);
      connectDB();
      resolve(s);
    });
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };

