const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  questionTitle: String,
  complexity: Number
});

const leaderboardSchema = new mongoose.Schema({
  username: String,
  solutions: [solutionSchema],
  totalComplexity: Number
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
