const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT =  3000;

// Enhanced CORS configuration
// In server.js
app.use(cors({
  origin: true, // Reflects the request origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));


// Schema
const submissionSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    trim: true,
    maxlength: [50, 'Username cannot be more than 50 characters']
  },
  questionTitle: { 
    type: String, 
    required: [true, 'Question title is required'],
    trim: true
  },
  weight: { 
    type: Number, 
    default: 1,
    min: [1, 'Weight must be at least 1']
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Indexes
submissionSchema.index({ username: 1 });
submissionSchema.index({ questionTitle: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    dbState: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// In your server.js (backend)
app.post('/api/submissions', async (req, res) => {
  try {
   
    
    // Validate required fields
    if (!req.body.questionTitle) {
      return res.status(400).json({
        success: false,
        message: 'Question title is required',
        received: req.body
      });
    }

    // Create submission with anonymous username if not provided
    const submission = new Submission({
      username: req.body.username || `Anonymous_${Math.floor(Math.random() * 10000)}`,
      questionTitle: req.body.questionTitle,
      questionId: req.body.questionId, 
      weight: req.body.weight 
    });

    // Attempt to save
    const savedSubmission = await submission.save();
    
    console.log('Saved submission:', savedSubmission); // Debug log
    
    return res.status(201).json({
      success: true,
      message: 'Submission saved successfully',
      data: savedSubmission
    });

  } catch (err) {
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate submission detected'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to save submission',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Leaderboard route
// Updated leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Get latest submissions for each question per user
    const latestSubmissions = await Submission.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            username: "$username",
            questionTitle: "$questionTitle"
          },
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);

    // Calculate leaderboard scores
    const leaderboardData = await Submission.aggregate([
      {
        $match: { 
          _id: { $in: latestSubmissions.map(s => s._id) }
        }
      },
      {
        $group: {
          _id: "$username",
          totalScore: { $sum: "$weight" },
          questionCount: { $sum: 1 },
          lastSubmission: { $max: "$timestamp" },
          submissions: {
            $push: {
              questionTitle: "$questionTitle",
              weight: "$weight"
            }
          }
        }
      },
      { $sort: { totalScore: -1, lastSubmission: 1 } },
      {
        $project: {
          _id: 0,
          username: "$_id",
          totalScore: 1,
          questionCount: 1,
          lastSubmission: 1,
          submissions: 1
        }
      }
    ]);

    // Ensure no null/undefined usernames
    const cleanLeaderboard = leaderboardData.map(user => ({
      ...user,
      username: user.username || 'Invalid User' // Fallback for any null usernames
    }));

    res.json({ 
      success: true, 
      data: cleanLeaderboard 
    });

  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});
app.post('/api/submissions', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
        
      });
      
    }

  } catch (err) {
    // Error handling
  }
});
// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
// Example route
app.post('/submit', (req, res) => {
    res.json({ message: 'Score submitted!' });
});

// Ping route
app.get('/ping', (req, res) => {
    res.status(200).send('Leaderboard OK');
});
// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('Server and MongoDB connection closed');
        process.exit(0);
      });
    });
  });
});
