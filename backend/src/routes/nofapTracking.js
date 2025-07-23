const express = require('express');
const MasturbationTracking = require('../models/MasturbationTracking');
const auth = require('../middleware/auth');

const router = express.Router();

// Upsert status for a date
router.post('/', auth, async (req, res) => {
  const { date, masturbated } = req.body;
  if (!date || typeof masturbated !== 'boolean') return res.status(400).json({ message: 'Missing date or masturbated' });
  const filter = { user: req.userId, date };
  const update = { masturbated, updated_at: new Date() };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const entry = await MasturbationTracking.findOneAndUpdate(filter, update, options);
  res.json(entry);
});

// Get status for a date
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Missing date' });
  const entry = await MasturbationTracking.findOne({ user: req.userId, date });
  res.json(entry);
});

// Get all history
router.get('/history', auth, async (req, res) => {
  const history = await MasturbationTracking.find({ user: req.userId }).sort({ date: 1 });
  res.json(history);
});

module.exports = router; 