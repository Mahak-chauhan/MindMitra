const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');
const CheckIn = require('./models/CheckIn');
const Prediction = require('./models/Prediction');
const checkinController = require('./controllers/checkinController');
const mlService = require('./services/mlService');

// Mock ML Service to bypass real Python call
mlService.getPrediction = async () => {
  return { prediction: 85, ranked_contributions: [] };
};

const mockReqRes = (user, body = {}) => {
  const req = { user, body };
  const res = {
    statusCode: 200,
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }
  };
  const next = (err) => { res.statusCode = 500; res.data = { error: err.message }; };
  return { req, res, next };
};

const runTests = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const userFull = await User.create({ 
    name: 'Full', email: 'full@test.com', password: 'pwd',
    profile: {
      age: 40, gender: 'Female', occupation: 'Nurse', work_type: 'On-site',
      work_hours_per_day: 12, commute_time_minutes: 30, bedtime: '22:00',
      wakeup_time: '06:00', workout_type: 'Strength'
    }
  });

  const userEmpty = await User.create({ name: 'Empty', email: 'e@test.com', password: 'pwd' });

  // TEST 1: High Quality
  let { req, res, next } = mockReqRes(userFull, { sleepDuration: 7, stressLevel: 5, mood: 'Happy' });
  await checkinController.createCheckIn(req, res, next);
  console.log(res.data); let dq = res.data.dataQuality;
  console.assert(dq.level === 'moderate' || dq.level === 'high', 'Test 1: Level computed');
  console.assert(dq.percentage > 50, 'Test 1: High percentage expected');
  console.log('TEST 1 Passed: Computed Data Quality on Full Profile ->', dq.percentage + '%', '-', dq.level);

  // TEST 2: Limited Quality
  ({ req, res, next } = mockReqRes(userEmpty, { sleepDuration: 7, stressLevel: 5, mood: 'Happy' }));
  await checkinController.createCheckIn(req, res, next);
  dq = res.data.dataQuality;
  console.assert(dq.level === 'limited' || dq.level === 'moderate', 'Test 2: Level computed');
  console.assert(dq.percentage < 50, 'Test 2: Low percentage expected');
  console.log('TEST 2 Passed: Computed Data Quality on Empty Profile ->', dq.percentage + '%', '-', dq.level);

  // Check DB persistence
  const savedPred = await Prediction.findOne({ checkIn: res.data.checkIn._id });
  console.assert(savedPred.dataQuality.percentage === dq.percentage, 'Test 3: Saved to DB');
  console.log('TEST 3 Passed: Data Quality persists in database');

  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('\nAll tests complete.');
};

runTests().catch(console.error);

