const WebSocket = require('ws');
const redis = require('redis');

const wss = new WebSocket.Server({ port: 8080 });
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

redisClient.connect();

// Subscribe to Redis channel for leaderboard updates
redisClient.subscribe('leaderboard_updates', (message) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'leaderboard_update',
        payload: JSON.parse(message)
      }));
    }
  });
});

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

module.exports = wss;