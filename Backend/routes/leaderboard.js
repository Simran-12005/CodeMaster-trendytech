const express = require('express');
const router = express.Router();
const { redisClient } = require('../server');
const Submission = require('../models/submission');

// Get leaderboard with caching
router.get('/', async (req, res) => {
  try {
    // Check cache first
    const cached = await redisClient.get('leaderboard:cache');
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Aggregate data from MongoDB
    const leaderboard = await Submission.aggregate([
      {
        $group: {
          _id: "$username",
          totalComplexity: { $sum: "$complexityScore" },
          submissions: { $push: "$$ROOT" }
        }
      },
      { $sort: { totalComplexity: 1 } }, // Sort by best (lowest) complexity
      { $limit: 100 } // Top 100 users
    ]);
    
    // Cache for 5 minutes
    await redisClient.set('leaderboard:cache', JSON.stringify(leaderboard), {
      EX: 300 // 5 minutes expiration
    });
    
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;