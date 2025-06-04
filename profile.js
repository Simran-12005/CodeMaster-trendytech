// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('./Users'); // Your user model

// Middleware to check if logged in
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.redirect('/login');

    res.render('profile', { user }); // rendering HTML with user data
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
