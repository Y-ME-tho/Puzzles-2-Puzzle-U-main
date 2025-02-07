const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Port from environment or fallback to 3000
const PORT = process.env.PORT || 3000;

// Connection string from environment (e.g., MONGODB_URI on Render) or local fallback
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/puzzlesDB';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB!'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Example puzzle config
const CURRENT_WEEK = 'week1';
const CORRECT_ANSWER = '42';

// Schema & Model
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  week: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Submission = mongoose.model('Submission', submissionSchema);

// Root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Welcome to the Puzzles Backend!');
});

// POST /submit
app.post('/submit', async (req, res) => {
  try {
    const { name, email, answer } = req.body;
    if (!name || !email || !answer) {
      return res.status(400).json({ error: 'Missing name, email, or answer.' });
    }
    const attemptCount = await Submission.countDocuments({ email, week: CURRENT_WEEK });
    if (attemptCount >= 3) {
      return res.status(400).json({ error: 'Max attempts reached for this puzzle/week.' });
    }
    const isCorrect = answer.trim().toLowerCase() === CORRECT_ANSWER.trim().toLowerCase();
    const newSubmission = new Submission({ name, email, week: CURRENT_WEEK, isCorrect });
    await newSubmission.save();
    res.json({ success: true, isCorrect });
  } catch (error) {
    console.error('Error in /submit route:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// GET /leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      {
        $group: {
          _id: { email: '$email', name: '$name' },
          totalAttempts: { $sum: 1 },
          problemsSolved: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      { $sort: { problemsSolved: -1, totalAttempts: 1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          email: '$_id.email',
          totalAttempts: 1,
          problemsSolved: 1,
        },
      },
    ]);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error in /leaderboard route:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
