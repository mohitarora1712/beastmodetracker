const express = require('express');
const DailyGoal = require('../models/DailyGoal');
const StreakDay = require('../models/StreakDay');
const auth = require('../middleware/auth');

const router = express.Router();

// Upsert daily goal completion
router.post('/', auth, async (req, res) => {
  const { date, goal_id, completed } = req.body;
  if (!date || !goal_id) return res.status(400).json({ message: 'Missing date or goal_id' });
  const filter = { user: req.userId, date, goal_id };
  const update = { completed, updated_at: new Date() };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const goal = await DailyGoal.findOneAndUpdate(filter, update, options);

  // Check if 3 or more goals are completed for this date
  const completedGoals = await DailyGoal.find({ user: req.userId, date, completed: true });
  if (completedGoals.length >= 3) {
    await StreakDay.findOneAndUpdate(
      { user: req.userId, date },
      { user: req.userId, date },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } else {
    await StreakDay.deleteOne({ user: req.userId, date });
  }

  res.json(goal);
});

// Get all daily goals for a date
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Missing date' });
  const goals = await DailyGoal.find({ user: req.userId, date });
  res.json(goals);
});

// Get all streak days
router.get('/streak-days', auth, async (req, res) => {
  const days = await StreakDay.find({ user: req.userId });
  res.json(days.map(d => d.date));
});

module.exports = router; 