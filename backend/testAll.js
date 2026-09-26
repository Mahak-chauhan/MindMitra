const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// Set dummy JWT secret for testing
process.env.JWT_SECRET = 'test_secret_123';
process.env.JWT_EXPIRES_IN = '1h';

const { spawn } = require('child_process');

async function runTests() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('MongoDB Memory Server running at', uri);
  
  const env = Object.assign({}, process.env, { MONGODB_URI: uri, PORT: 5005 });
  const serverProcess = spawn('node', ['server.js'], { env, cwd: __dirname });
  
  serverProcess.stdout.on('data', data => console.log('SERVER:', data.toString().trim()));
  serverProcess.stderr.on('data', data => console.error('SERVER ERR:', data.toString().trim()));
  
  await new Promise(r => setTimeout(r, 3000));
  
  const baseUrl = 'http://localhost:5005/api';
  let token = null;

  try {
    console.log('\n--- B. Registration ---');
    let res = await fetch(baseUrl + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' })
    });
    let data = await res.json();
    console.log('Register status:', res.status);
    console.log('Register response:', data);
    
    console.log('\n--- C. Duplicate Email ---');
    res = await fetch(baseUrl + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User 2', email: 'test@example.com', password: 'password123' })
    });
    data = await res.json();
    console.log('Duplicate status:', res.status);
    console.log('Duplicate response:', data);
    
    console.log('\n--- D. Password Hashed ---');
    await mongoose.connect(uri);
    const dbUser = await mongoose.model('User', new mongoose.Schema({ email: String, password: {type: String, select: true} })).findOne({email: 'test@example.com'}).select('+password');
    console.log('Raw DB Password:', dbUser.password);
    console.log('Is Hashed?', dbUser.password !== 'password123');

    console.log('\n--- E. Login Success ---');
    res = await fetch(baseUrl + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    data = await res.json();
    console.log('Login status:', res.status);
    if(data.token) {
        console.log('Token received');
        token = data.token;
    }

    console.log('\n--- F. Login Fail ---');
    res = await fetch(baseUrl + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
    });
    data = await res.json();
    console.log('Login fail status:', res.status, data);

    console.log('\n--- G/H. Missing/Invalid JWT ---');
    res = await fetch(baseUrl + '/auth/me');
    console.log('Missing JWT status:', res.status);
    res = await fetch(baseUrl + '/auth/me', { headers: { 'Authorization': 'Bearer badtoken' }});
    console.log('Invalid JWT status:', res.status);

    console.log('\n--- I/J. Valid JWT /me ---');
    res = await fetch(baseUrl + '/auth/me', { headers: { 'Authorization': 'Bearer ' + token }});
    data = await res.json();
    console.log('Me status:', res.status);
    console.log('Me data:', data);

  } finally {
    serverProcess.kill();
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runTests().catch(console.error);
