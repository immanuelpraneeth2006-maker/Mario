/**
 * Automated test runner for Server API endpoints
 */
const http = require('http');
const net = require('net');

const checkPort = (port, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('--- Running Server API Tests ---');
  let startedServer = null;
  try {
    const isRunning = await checkPort(5000);
    if (!isRunning) {
      console.log('Port 5000 idle: starting test instance of Mario server...');
      const { startServer } = require('../server');
      startedServer = await startServer(5000);
      await new Promise(r => setTimeout(r, 600));
    }

    // 1. Health check
    console.log('1. Testing /api/health...');
    const health = await request('/api/health');
    console.log('   Status:', health.status, 'Body:', health.body);

    // 2. Levels
    console.log('2. Testing /api/levels...');
    const levels = await request('/api/levels');
    console.log('   Status:', levels.status, 'Found levels:', levels.body.levels.length);

    // 3. Register user
    const testUsername = 'HeroTester_' + Math.floor(Math.random() * 1000);
    console.log(`3. Testing /api/auth/register for ${testUsername}...`);
    const reg = await request('/api/auth/register', 'POST', {
      username: testUsername,
      password: 'password123',
      email: `${testUsername}@example.com`
    });
    console.log('   Status:', reg.status, 'Success:', reg.body.success, 'Token received:', !!reg.body.token);
    const token = reg.body.token;
    const userId = reg.body.user.id;

    // 4. Test Auth /me
    console.log('4. Testing /api/auth/me with JWT...');
    const me = await request('/api/auth/me', 'GET', null, token);
    console.log('   Status:', me.status, 'User:', me.body.user.username);

    // 5. Save & Fetch Progress
    console.log('5. Testing /api/progress saving & retrieval...');
    const saveProg = await request(`/api/progress/${userId}`, 'POST', {
      username: testUsername,
      currentLevel: 1,
      levelsCompleted: [1],
      health: 3,
      hunger: 95,
      totalScore: 1500,
      coins: 15
    });
    console.log('   Saved progress status:', saveProg.status);

    const getProg = await request(`/api/progress/${userId}`, 'GET');
    console.log('   Retrieved score:', getProg.body.progress.totalScore, 'Coins:', getProg.body.progress.coins);

    // 6. Submit & Fetch Leaderboard
    console.log('6. Testing /api/leaderboard...');
    const scoreRes = await request('/api/leaderboard', 'POST', {
      userId,
      username: testUsername,
      score: 1500,
      timeElapsed: 65,
      coinsCollected: 15,
      levelId: 1
    });
    console.log('   Score submit status:', scoreRes.status);

    const leaderRes = await request('/api/leaderboard', 'GET');
    console.log('   Leaderboard count:', leaderRes.body.scores.length, 'Top entry:', leaderRes.body.scores[0]?.username);

    console.log('--- ALL SERVER API TESTS PASSED SUCCESSFULLY! ---');
    if (startedServer) {
      startedServer.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test failed:', err);
    if (startedServer) {
      startedServer.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }
}

runTests();
