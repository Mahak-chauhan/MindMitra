require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database (Only if URI is provided in .env)
connectDB();

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindMitra API is running' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/checkins', require('./routes/checkinRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/diary', require('./routes/diaryRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));
app.use('/api/wellbeing', require('./routes/wellbeingRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT}`);
});

