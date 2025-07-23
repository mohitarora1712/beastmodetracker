const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// Upsert journal entry for a date
router.post('/', auth, async (req, res) => {
  const { date, content } = req.body;
  if (!date) return res.status(400).json({ message: 'Missing date' });
  const filter = { user: req.userId, date };
  const update = { content };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const entry = await JournalEntry.findOneAndUpdate(filter, update, options);
  res.json(entry);
});

// Get journal entry for a date
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Missing date' });
  const entry = await JournalEntry.findOne({ user: req.userId, date });
  res.json(entry);
});

// Get all journal entries for user
router.get('/all', auth, async (req, res) => {
  const entries = await JournalEntry.find({ user: req.userId });
  res.json(entries);
});

module.exports = router; 