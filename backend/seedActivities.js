const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const WellnessActivity = require('./models/WellnessActivity');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const activities = [
  { title: "2-Minute Slow Breathing", category: "Breathing", duration_minutes: 2, description: "A quick breathing reset to lower heart rate.", instructions: "Inhale for 4 seconds, hold for 2, exhale for 6.", difficulty: "Beginner" },
  { title: "Box Breathing Practice", category: "Breathing", duration_minutes: 5, description: "Structured breathing to regain focus and calm.", instructions: "Inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat.", difficulty: "Beginner" },
  { title: "5-Minute Mindful Pause", category: "Meditation", duration_minutes: 5, description: "A short mindfulness session to center your thoughts.", instructions: "Close your eyes and focus entirely on the sensation of your breath.", difficulty: "Beginner" },
  { title: "Body Awareness Reset", category: "Meditation", duration_minutes: 10, description: "A structured body scan to release physical tension.", instructions: "Mentally scan your body from toes to head, consciously relaxing each muscle group.", difficulty: "Beginner" },
  { title: "5-Minute Stretch", category: "Movement", duration_minutes: 5, description: "Gentle stretching to relieve desk stiffness.", instructions: "Perform gentle neck rolls, shoulder shrugs, and torso twists.", difficulty: "Beginner" },
  { title: "10-Minute Light Walk", category: "Movement", duration_minutes: 10, description: "A brief walk to improve circulation and mood.", instructions: "Take a gentle paced walk, preferably outside or away from your workspace.", difficulty: "Beginner" },
  { title: "Progressive Relaxation", category: "Relaxation", duration_minutes: 10, description: "Systematically tense and release muscle groups.", instructions: "Tense your feet for 5s, then release. Move up your body incrementally.", difficulty: "Intermediate" },
  { title: "Quiet Reset", category: "Relaxation", duration_minutes: 3, description: "Total silence and stillness to reduce sensory overload.", instructions: "Find a quiet space, close your eyes, and sit comfortably doing nothing.", difficulty: "Beginner" },
  { title: "Focus Music Break", category: "Music", duration_minutes: 15, description: "Listen to instrumental music designed to aid concentration.", instructions: "Put on headphones and play ambient or classical focus music.", difficulty: "Beginner" },
  { title: "Calming Music Pause", category: "Music", duration_minutes: 5, description: "A short break with slow-tempo soothing audio.", instructions: "Listen to nature sounds, singing bowls, or slow lo-fi tracks.", difficulty: "Beginner" },
  { title: "Screen-Free Wind-Down", category: "Sleep Routine", duration_minutes: 30, description: "Prepare for sleep by eliminating blue light.", instructions: "Turn off all screens. Read a physical book, journal, or stretch instead.", difficulty: "Beginner" },
  { title: "Prepare-For-Sleep Routine", category: "Sleep Routine", duration_minutes: 15, description: "A sequence to signal to your body that it's time to sleep.", instructions: "Dim lights, wash your face with warm water, and practice light stretching.", difficulty: "Beginner" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for Seeding...');
    await WellnessActivity.deleteMany({});
    await WellnessActivity.insertMany(activities);
    console.log('Wellness Activities Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
