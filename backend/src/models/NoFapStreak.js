const mongoose = require('mongoose');

const noFapStreakSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NoFapStreak', noFapStreakSchema); 