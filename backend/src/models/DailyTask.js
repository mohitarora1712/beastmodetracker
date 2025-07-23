const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  task_id: { type: String, required: true },
  completed: { type: Boolean, default: false },
  updated_at: { type: Date, default: Date.now },
});

dailyTaskSchema.index({ user: 1, date: 1, task_id: 1 }, { unique: true });

module.exports = mongoose.model('DailyTask', dailyTaskSchema); 