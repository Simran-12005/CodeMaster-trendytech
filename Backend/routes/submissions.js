const express = require('express');
const router = express.Router();
const Submission = require('../models/submission');
const { redisClient } = require('../server');

// Submit code and update leaderboard
router.post('/', async (req, res) => {
  try {
    const { username, questionId, questionTitle, language, complexityScore, code, testResults } = req.body;
    
    // Save to MongoDB
    const submission = new Submission({
      username,
      questionId,
      questionTitle,
      language,
      complexityScore,
      code,
      testResults
    });
    
    await submission.save();
    
    // Update Redis sorted set for leaderboard
    await redisClient.zAdd('leaderboard:scores', [
      { score: complexityScore, value: `${username}:${questionId}` }
    ]);
    
    // Invalidate leaderboard cache
    await redisClient.del('leaderboard:cache');
    
    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;