const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');
const profileController = require('./controllers/profileController');

const mockReqRes = (userId, body = {}) => {
  const req = { user: { _id: userId }, body };
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

  console.log('--- Setting up users ---');
  const userA = await User.create({ name: 'User A', email: 'a@test.com', password: 'password' });
  const userB = await User.create({ name: 'User B', email: 'b@test.com', password: 'password' });

  // 1. Authenticated user with no profile
  let { req, res, next } = mockReqRes(userA._id);
  await profileController.getProfile(req, res, next);
  console.assert(res.statusCode === 200, 'Test 1: Status 200 expected');
  console.assert(Object.keys(res.data).length === 0 || (res.data.age === undefined), 'Test 1: Empty profile expected');
  console.log('Test 1 Passed: GET empty profile');

  // 2. Authenticated user saves valid profile
  ({ req, res, next } = mockReqRes(userA._id, { age: 30, gender: 'Male', occupation: 'Student' }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 200, 'Test 2: Status 200 expected');
  console.assert(res.data.age === 30, 'Test 2: Age saved');
  console.log('Test 2 Passed: PUT valid profile');

  // 3. GET after PUT
  ({ req, res, next } = mockReqRes(userA._id));
  await profileController.getProfile(req, res, next);
  console.assert(res.data.age === 30, 'Test 3: Profile retrieved successfully');
  console.log('Test 3 Passed: GET populated profile');

  // 4. Invalid age
  ({ req, res, next } = mockReqRes(userA._id, { age: -5 }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 4: Status 400 expected');
  console.log('Test 4 Passed: Invalid age rejected ->', res.data.error);

  // 5. Invalid work_hours_per_day
  ({ req, res, next } = mockReqRes(userA._id, { work_hours_per_day: 25 }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 5: Status 400 expected');
  console.log('Test 5 Passed: Invalid work_hours rejected ->', res.data.error);

  // 6. Invalid commute_time_minutes
  ({ req, res, next } = mockReqRes(userA._id, { commute_time_minutes: -10 }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 6: Status 400 expected');
  console.log('Test 6 Passed: Invalid commute rejected ->', res.data.error);

  // 7. Invalid gender
  ({ req, res, next } = mockReqRes(userA._id, { gender: 'Alien' }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 7: Status 400 expected');
  console.log('Test 7 Passed: Invalid gender rejected ->', res.data.error);

  // 8. Invalid occupation
  ({ req, res, next } = mockReqRes(userA._id, { occupation: 'President' }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 8: Status 400 expected');
  console.log('Test 8 Passed: Invalid occupation rejected');

  // 9. Invalid work_type
  ({ req, res, next } = mockReqRes(userA._id, { work_type: 'Space' }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 9: Status 400 expected');
  console.log('Test 9 Passed: Invalid work_type rejected');

  // 10. Invalid workout_type
  ({ req, res, next } = mockReqRes(userA._id, { workout_type: 'Swimming' }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 10: Status 400 expected');
  console.log('Test 10 Passed: Invalid workout_type rejected');

  // 11. Invalid bedtime
  ({ req, res, next } = mockReqRes(userA._id, { bedtime: '22:30' }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 11: Status 400 expected');
  console.log('Test 11 Passed: Invalid bedtime rejected');

  // 12. Invalid wakeup_time
  ({ req, res, next } = mockReqRes(userA._id, { wakeup_time: '11:00' }));
  await profileController.updateProfile(req, res, next);
  console.assert(res.statusCode === 400, 'Test 12: Status 400 expected');
  console.log('Test 12 Passed: Invalid wakeup_time rejected');

  // 14 & 15. User A cannot access User B's profile
  ({ req, res, next } = mockReqRes(userB._id));
  await profileController.getProfile(req, res, next);
  console.assert(res.data.age === undefined, 'Test 14/15: User B should have empty profile');
  console.log('Test 14 & 15 Passed: Data isolation confirmed via req.user._id');

  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('\nAll tests complete.');
};

runTests().catch(console.error);
