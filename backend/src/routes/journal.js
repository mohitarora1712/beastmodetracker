const express = require('express');
const jwt = require('jsonwebtoken');
const JournalEntry = require('../models/JournalEntry');

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

// Create journal entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const entry = new JournalEntry({
      user: req.userId,
      content: req.body.content,
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all journal entries for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update journal entry
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { content: req.body.content },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete journal entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 