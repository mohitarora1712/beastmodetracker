const express = require('express');
const CustomTask = require('../models/CustomTask');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all custom tasks for user
router.get('/', auth, async (req, res) => {
  const tasks = await CustomTask.find({ user: req.userId }).sort({ created_at: -1 });
  res.json(tasks);
});

// Create a new custom task
router.post('/', auth, async (req, res) => {
  const { title, description, emoji } = req.body;
  const task = new CustomTask({
    user: req.userId,
    title,
    description,
    emoji,
  });
  await task.save();
  res.status(201).json(task);
});

// Update a custom task
router.put('/:id', auth, async (req, res) => {
  const { title, description, emoji } = req.body;
  const task = await CustomTask.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { title, description, emoji, updated_at: new Date() },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Delete a custom task
router.delete('/:id', auth, async (req, res) => {
  const task = await CustomTask.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router; 