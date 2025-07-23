const express = require('express');
const jwt = require('jsonwebtoken');
const NoFapStreak = require('../models/NoFapStreak');

const router = express.Router();

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Start a new streak
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const streak = new NoFapStreak({
      user: req.userId,
      startDate: new Date(),
    });
    await streak.save();
    res.status(201).json(streak);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// End the current streak
router.post('/end', authMiddleware, async (req, res) => {
  try {
    const streak = await NoFapStreak.findOne({ user: req.userId, endDate: { $exists: false } }).sort({ startDate: -1 });
    if (!streak) return res.status(404).json({ message: 'No active streak found' });
    streak.endDate = new Date();
    await streak.save();
    res.json(streak);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all streaks for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const streaks = await NoFapStreak.find({ user: req.userId }).sort({ startDate: -1 });
    res.json(streaks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 