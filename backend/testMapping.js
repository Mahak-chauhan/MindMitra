const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');
const DigitalWellbeing = require('./models/DigitalWellbeing');
const CheckIn = require('./models/CheckIn');
const Prediction = require('./models/Prediction');
const checkinController = require('./controllers/checkinController');
const mlService = require('./services/mlService');

// Mock ML Service to capture the payload
let capturedFeatures = null;
mlService.getPrediction = async (features, target) => {
  capturedFeatures = features;
  return { prediction: 85, ranked_contributions: [] };
};

const runTests = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user = await User.create({ name: 'Test', email: 'test@test.com', password: 'password' });

  // TEST A: Digital Wellbeing exists
  console.log('--- TEST A: Digital Wellbeing Exists ---');
  await DigitalWellbeing.create({
    user: user._id,
    total_screen_time_hours: 8.5,
    social_media_minutes: 120,
    night_screen_time_minutes: 45
  });

  const reqA = {
    user: { _id: user._id },
    body: { sleepDuration: 6.5, stressLevel: 5, sleepQuality: 6, physicalActivityMinutes: 30, mood: 'Neutral' }
  };
  
  let resJsonA = null;
  const resA = {
    status: () => resA,
    json: (data) => { resJsonA = data; }
  };

  await checkinController.createCheckIn(reqA, resA, (err) => console.error("Error from controller A:", err));

  if (capturedFeatures && capturedFeatures.screen_time_hours === 8.5 && capturedFeatures.social_media_hours === 2.0) {
    console.log('PASS: Actual Digital Wellbeing values reached ML payload');
  } else {
    console.error('FAIL: Values were overwritten:', capturedFeatures);
  }

  if (resJsonA && resJsonA.provenance.screen_time_hours === 'digital_wellbeing' && resJsonA.provenance.sleep_duration === 'user_input') {
    console.log('PASS: Provenance correctly identifies sources for A');
  } else {
    console.error('FAIL: Provenance incorrect:', resJsonA ? resJsonA.provenance : 'No response');
  }

  // TEST B: Digital Wellbeing does not exist
  console.log('\n--- TEST B: Digital Wellbeing Does Not Exist (New User) ---');
  const user2 = await User.create({ name: 'Test2', email: 'test2@test.com', password: 'password' });
  
  const reqB = {
    user: { _id: user2._id },
    body: { sleepDuration: 8.0, stressLevel: 2, sleepQuality: 8, mood: 'Happy' }
  };
  
  let resJsonB = null;
  const resB = {
    status: () => resB,
    json: (data) => { resJsonB = data; }
  };

  capturedFeatures = null; // reset
  await checkinController.createCheckIn(reqB, resB, (err) => console.error("Error from controller B:", err));

  if (capturedFeatures && capturedFeatures.screen_time_hours === 4.0 && capturedFeatures.social_media_hours === 1.5) {
    console.log('PASS: Fallback behavior works without crashing');
  } else {
    console.error('FAIL: Fallback values incorrect:', capturedFeatures);
  }
  
  if (resJsonB && resJsonB.provenance.screen_time_hours === 'default' && resJsonB.provenance.sleep_duration === 'user_input') {
    console.log('PASS: Provenance identifies missing wellbeing as default');
  } else {
    console.error('FAIL: Provenance incorrect for fallback:', resJsonB ? resJsonB.provenance : 'No response');
  }

  // TEST C: Verify no duplicate keys
  console.log('\n--- TEST C: Verify no duplicate keys ---');
  if (capturedFeatures) {
    const featureKeys = Object.keys(capturedFeatures);
    const uniqueKeys = new Set(featureKeys);
    if (featureKeys.length === uniqueKeys.size) {
      console.log('PASS: No duplicate feature keys exist');
    } else {
      console.error('FAIL: Duplicate keys found in ML payload');
    }
  } else {
    console.error('FAIL: capturedFeatures is null');
  }

  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('\nAll tests complete.');
};

runTests().catch(console.error);
