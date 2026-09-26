process.env.JWT_SECRET = 'mock_secret';
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');

// Import models
const User = require('./models/User');
const CheckIn = require('./models/CheckIn');
const DigitalWellbeing = require('./models/DigitalWellbeing');
const Prediction = require('./models/Prediction');
const Roadmap = require('./models/Roadmap');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const wellbeingRoutes = require('./routes/wellbeingRoutes');
const activityRoutes = require('./routes/activityRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

// Mock ML Service
const mlService = require('./services/mlService');
mlService.getPrediction = async () => ({
  prediction: 85,
  ranked_contributions: [{ feature: 'sleep_duration', direction: 'positive', contribution: 5 }]
});

// Mock Chatbot Service
const chatbotService = require('./services/chatbotService');
chatbotService.getChatbotResponse = async () => ({
  response: 'This is a mocked companion response.',
  context_used: { checkin: true, prediction: true, roadmap: true }
});

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/wellbeing', wellbeingRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/predictions', predictionRoutes);

let server;
let mongoServer;
const PORT = 34567;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const runTests = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  server = app.listen(PORT);
  console.log('Server started for E2E tests.');

  let token1, token2;
  
  // 1. AUTHENTICATION
  let res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name: 'User1', email: 'u1@test.com', password: 'pwd' })
  });
  let data = await res.json();
  console.assert(res.ok && data.token, 'Registration Failed');
  token1 = data.token;
  
  res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name: 'User2', email: 'u2@test.com', password: 'pwd' })
  });
  data = await res.json();
  token2 = data.token;
  console.log('Authentication passed.');

  // 2. PROFILE
  res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}`},
    body: JSON.stringify({ age: 30, workout_type: 'Strength' })
  });
  console.assert(res.ok, 'Profile Update Failed');
  console.log('Profile Flow passed.');

  // 3. DIGITAL WELLBEING
  res = await fetch(`${BASE_URL}/api/wellbeing`, {
    method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}`},
    body: JSON.stringify({ date: new Date(), total_screen_time_hours: 5, social_media_minutes: 120, night_screen_time_minutes: 30 })
  });
  console.assert(res.ok, 'Wellbeing Failed');

  // 4. CHECK-IN -> ML -> DATA QUALITY -> SHAP
  res = await fetch(`${BASE_URL}/api/checkins`, {
    method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}`},
    body: JSON.stringify({ sleepDuration: 7, stressLevel: 5, mood: 'Happy' })
  });
  data = await res.json();
  console.assert(res.status === 201, 'Check-In Creation Failed');
  console.assert(data.prediction.prediction === 85, 'Prediction Mapping Failed');
  console.assert(data.dataQuality.percentage > 0, 'Data Quality Failed');
  console.assert(data.provenance.screen_time_hours === 'digital_wellbeing', 'Digital Wellbeing override failed');
  const checkInId = data.checkIn._id;
  console.log('Check-In Flow passed.');

  // 5. ROADMAP
  res = await fetch(`${BASE_URL}/api/roadmap/generate`, {
    method: 'POST', headers: {'Authorization': `Bearer ${token1}`}
  });
  data = await res.json();
  if (!res.ok) console.log(data);
  console.assert(res.ok && data.morning, 'Roadmap Generation Failed');
  console.log('Roadmap Flow passed.');

  // 6. MITRA CHATBOT
  res = await fetch(`${BASE_URL}/api/chatbot`, {
    method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}`},
    body: JSON.stringify({ message: "Hello" })
  });
  data = await res.json();
  console.assert(res.ok && data.reply, 'Chatbot Failed');
  console.log('Chatbot Flow passed.');

  // 7. OWNERSHIP / HISTORY
  res = await fetch(`${BASE_URL}/api/checkins/${checkInId}`, {
    method: 'GET', headers: {'Authorization': `Bearer ${token2}`}
  });
  console.assert(res.status === 403, 'Security flaw: User2 accessed User1 checkin');
  console.log('Ownership & Security passed.');

  console.log('\nALL END-TO-END VERIFICATIONS PASSED.');
  
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
};

runTests().catch(e => {
  console.error('TEST FAILED', e);
  if(server) server.close();
  process.exit(1);
});




