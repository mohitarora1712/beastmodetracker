const express = require('express');
const DailyTask = require('../models/DailyTask');
const CompletedDay = require('../models/CompletedDay');
const auth = require('../middleware/auth');

const router = express.Router();

// Upsert daily task completion
router.post('/', auth, async (req, res) => {
  const { date, task_id, completed } = req.body;
  if (!date || !task_id) return res.status(400).json({ message: 'Missing date or task_id' });
  const filter = { user: req.userId, date, task_id };
  const update = { completed, updated_at: new Date() };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const task = await DailyTask.findOneAndUpdate(filter, update, options);

  // Check if all 4 tasks are completed for this date
  const allTasks = await DailyTask.find({ user: req.userId, date, completed: true });
  if (allTasks.length === 4) {
    await CompletedDay.findOneAndUpdate(
      { user: req.userId, date },
      { user: req.userId, date },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } else {
    await CompletedDay.deleteOne({ user: req.userId, date });
  }

  res.json(task);
});

// Get all daily tasks for a date
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Missing date' });
  const tasks = await DailyTask.find({ user: req.userId, date });
  res.json(tasks);
});

// Get all completed days
router.get('/completed-days', auth, async (req, res) => {
  const days = await CompletedDay.find({ user: req.userId });
  res.json(days.map(d => d.date));
});

module.exports = router; 