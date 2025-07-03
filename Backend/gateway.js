const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080;

app.use(cors());

// ✅ Serve Homepage.html first for root '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Homepage.html'));
});

// ✅ Serve ALL other static files after '/'
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Proxy to backend server.js
app.use('/server', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/server': '' }
}));

// ✅ Proxy to leaderboard server
app.use('/leaderboard', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: { '^/leaderboard': '' }
}));

// ✅ Proxy to Flask backend
app.use('/flask', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: { '^/flask': '' }
}));

app.listen(PORT, () => {
    console.log(`🚀 Gateway running at http://localhost:${PORT}`);
});
