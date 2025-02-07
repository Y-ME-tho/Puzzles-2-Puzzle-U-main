/******************************************
 * server.js
 ******************************************/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// ----- MIDDLEWARE -----
app.use(bodyParser.json());
app.use(cors()); // so we can call the API from another domain or port

// ----- CONFIG -----
const PORT = process.env.PORT || 3000;

// IMPORTANT: Replace with your actual MongoDB connection string or keep local if you have MongoDB installed locally
mongoose.connect('mongodb://localhost:27017/puzzlesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// IMPORTANT: You can change these values each week
const CURRENT_WEEK = 'week2';
const CORRECT_ANSWER = '42';

// ----- SCHEMA & MODEL -----
// We'll store each submission with who submitted, whether correct, etc.
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  week: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model('Submission', submissionSchema);

// ----- ROUTES -----

/**
 * POST /submit
 * Receives { name, email, answer } from the puzzle form
 * Checks if user has <= 3 attempts for CURRENT_WEEK
 * Compares answer with CORRECT_ANSWER
 * Saves submission if allowed
 */
app.post('/submit', async (req, res) => {
  try {
    const { name, email, answer } = req.body;
    if (!name || !email || !answer) {
      return res.status(400).json({ error: 'Missing name, email, or answer.' });
    }

    // 1. Check how many attempts user has already made this week
    const attemptCount = await Submission.countDocuments({ email, week: CURRENT_WEEK });
    if (attemptCount >= 3) {
      return res.status(400).json({ error: 'Max attempts reached for this puzzle/week.' });
    }

    // 2. Check if answer matches the correct answer (case-insensitive)
    const isCorrect = answer.trim().toLowerCase() === CORRECT_ANSWER.trim().toLowerCase();

    // 3. Save the submission
    const newSubmission = new Submission({
      name,
      email,
      week: CURRENT_WEEK,
      isCorrect,
    });
    await newSubmission.save();

    // 4. Respond with success and correctness
    res.json({ success: true, isCorrect });
  } catch (error) {
    console.error('Error in /submit route:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

/**
 * GET /leaderboard
 * Returns up to 10 participants sorted by:
 *  - problemsSolved DESC
 *  - totalAttempts ASC (in tie)
 */
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      {
        $group: {
          _id: { email: '$email', name: '$name' },
          totalAttempts: { $sum: 1 },
          problemsSolved: {
            $sum: {
              $cond: ['$isCorrect', 1, 0],
            },
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

// ----- START SERVER -----
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
 
