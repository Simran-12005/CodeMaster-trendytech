require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1', 'http://localhost:8000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Database connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Leaderboard Entry Model with validation
const entrySchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'] },
  questionTitle: { type: String, required: [true, 'Question title is required'] },
  language: { type: String, required: [true, 'Language is required'] },
  complexityScore: { 
    type: Number, 
    required: [true, 'Complexity score is required'],
    min: [1, 'Complexity score must be at least 1']
  },
  timestamp: { type: Date, default: Date.now }
});

const Entry = mongoose.model('Entry', entrySchema);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    dbState: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// API Routes with improved error handling
app.get('/api/leaderboard', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ timestamp: -1 }).lean();
    
    if (!entries || entries.length === 0) {
      return res.status(404).json({ message: 'No entries found' });
    }
    
    const userTotals = entries.reduce((acc, entry) => {
      acc[entry.username] = (acc[entry.username] || 0) + entry.complexityScore;
      return acc;
    }, {});
    
    const users = Object.keys(userTotals).sort((a, b) => userTotals[a] - userTotals[b]);
    
    res.json({
      success: true,
      count: entries.length,
      entries,
      userTotals,
      users
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

app.post('/api/leaderboard', async (req, res) => {
  try {
    const { username, questionTitle, language, complexityScore } = req.body;
    
    // Validate input
    const missingFields = [];
    if (!username) missingFields.push('username');
    if (!questionTitle) missingFields.push('questionTitle');
    if (!language) missingFields.push('language');
    if (complexityScore === undefined) missingFields.push('complexityScore');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Check for existing entry
    const existingEntry = await Entry.findOne({
      username,
      questionTitle,
      language
    });
    
    let entry;
    if (existingEntry) {
      // Update if new score is better (lower)
      if (complexityScore < existingEntry.complexityScore) {
        existingEntry.complexityScore = complexityScore;
        existingEntry.timestamp = new Date();
        entry = await existingEntry.save();
      } else {
        entry = existingEntry;
      }
    } else {
      // Create new entry
      entry = new Entry({
        username,
        questionTitle,
        language,
        complexityScore
      });
      await entry.save();
    }
    
    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (err) {
    console.error('Error adding entry:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});