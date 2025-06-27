const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  username: String,
  questionsSolved: [String], // ⬅️ ensure it's an array of strings
  totalComplexity: Number,
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
