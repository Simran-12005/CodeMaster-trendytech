const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
import Leaderboard from './components/leaderboard';


// ✅ MongoDB Connection
mongoose.connect('mongodb://localhost:27017/CodeMaster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected ✅'))
.catch(err => console.error('MongoDB connection error ❌', err));

// ✅ Mongoose Schema and Model
const SolutionSchema = new mongoose.Schema({
  questionNumber: Number,
  complexity: Number
});

const LeaderboardSchema = new mongoose.Schema({
  username: String,
  solutions: [SolutionSchema]
});

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);

// ✅ API to Submit Solution
app.post('/api/submit-solution', async (req, res) => {
  const { username, questionNumber, complexity } = req.body;

  try {
    let user = await Leaderboard.findOne({ username });

    if (!user) {
      user = new Leaderboard({ username, solutions: [] });
    }

    const existingSolution = user.solutions.find(
      sol => sol.questionNumber === questionNumber
    );

    if (existingSolution) {
      existingSolution.complexity = complexity;
    } else {
      user.solutions.push({ questionNumber, complexity });
    }

    await user.save();
    res.status(200).json({ message: '✅ Solution saved!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// ✅ API to Fetch Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const allUsers = await Leaderboard.find({});
    res.json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error fetching leaderboard' });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
