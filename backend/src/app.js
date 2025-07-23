const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const journalRoutes = require('./routes/journal');
app.use('/api/journal', journalRoutes);
const taskRoutes = require('./routes/task');
app.use('/api/tasks', taskRoutes);
const nofapRoutes = require('./routes/nofap');
app.use('/api/nofap', nofapRoutes);
const customTasksRoutes = require('./routes/customTasks');
app.use('/api/custom-tasks', customTasksRoutes);
const dailyTasksRoutes = require('./routes/dailyTasks');
app.use('/api/daily-tasks', dailyTasksRoutes);
const dailyGoalsRoutes = require('./routes/dailyGoals');
app.use('/api/daily-goals', dailyGoalsRoutes);
const nofapTrackingRoutes = require('./routes/nofapTracking');
app.use('/api/nofap-tracking', nofapTrackingRoutes);
const journalEntriesRoutes = require('./routes/journalEntries');
app.use('/api/journal-entries', journalEntriesRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('BeastModeTracker Backend is running');
});

// TODO: Add routes for auth, journal, tasks, etc.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 