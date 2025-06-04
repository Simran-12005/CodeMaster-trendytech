require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const User = require('./Users'); // Your Mongoose model

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Change if your frontend is hosted elsewhere
  credentials: true
}));

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true only for HTTPS
}));

// --- Serve static frontend files (if any) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// --- User Registration ---
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
});


// --- User Login ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // ✅ Save user ID in session
    req.session.userId = user._id;

    res.status(200).json({ message: 'Login successful', userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});


// --- Get Logged-in User's Profile ---
app.get('/api/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ name: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('Welcome to CodeMaster backend!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
