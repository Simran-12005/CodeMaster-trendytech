app.get('/api/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ name: user.name });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
