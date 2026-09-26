const Roadmap = require('../models/Roadmap');
const CheckIn = require('../models/CheckIn');
const DigitalWellbeing = require('../models/DigitalWellbeing');
const WellnessActivity = require('../models/WellnessActivity');
const baselineService = require('./baselineService');

exports.generateRoadmap = async (userId) => {
  // Setup Date boundary for 'Today'
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if a roadmap already exists for today
  const existingRoadmap = await Roadmap.findOne({ user: userId, date: today });
  if (existingRoadmap) {
    return existingRoadmap;
  }

  // Fetch recent data
  const latestCheckIn = await CheckIn.findOne({ user: userId }).sort({ date: -1 });
  const latestWellbeing = await DigitalWellbeing.findOne({ user: userId }).sort({ date: -1 });
  
  // Try to get baseline
  let baselineSleepInfo = 'not established';
  let baselineStressInfo = 'not established';
  let personalizationLimited = true;

  if (latestCheckIn) {
    const baseline = await baselineService.calculateBaseline(userId, latestCheckIn);
    if (baseline.status === 'established') {
      personalizationLimited = false;
      baselineSleepInfo = baseline.metrics.sleep; // e.g. "below your usual pattern"
      baselineStressInfo = baseline.metrics.stress;
    }
  }

  // Fetch catalog to link activities if possible
  const activities = await WellnessActivity.find({ active: true });
  const findActivity = (cat, keyword) => activities.find(a => a.category === cat && a.title.toLowerCase().includes(keyword)) || activities.find(a => a.category === cat);

  let morning = [];
  let afternoon = [];
  let evening = [];
  let night = [];

  const add = (block, title, reason, duration, cat, keyword) => {
    const act = findActivity(cat, keyword);
    block.push({
      title: act ? act.title : title,
      description: act ? act.description : '',
      reason,
      duration_minutes: act ? act.duration_minutes : duration,
      activityId: act ? act._id : null
    });
  };

  // Rule 1: General Morning Start
  morning.push({
    title: 'Hydrate & Reflect',
    description: 'Drink a glass of water and review your day.',
    reason: 'Establishing a positive morning routine helps ground your day.',
    duration_minutes: 2,
    activityId: null
  });

  // Rule 2: High Stress -> Breathing / Relaxation
  if (latestCheckIn && latestCheckIn.stressLevel >= 7) {
    add(morning, 'Short Breathing', 'Your stress level was recorded as higher than usual.', 5, 'Breathing', 'breathing');
    add(afternoon, 'Recovery Break', 'A midday pause helps manage elevated stress.', 5, 'Relaxation', 'reset');
  }

  // Rule 3: Low Sleep -> Gentle Start & Sleep Routine
  if (latestCheckIn && latestCheckIn.sleepDuration < 6) {
    add(morning, 'Mindful Pause', 'Your sleep duration was lower than ideal; take a moment to center yourself.', 5, 'Meditation', 'mindful');
    add(evening, 'Sleep Routine Preparation', 'Preparing early for sleep helps overcome a recent sleep deficit.', 15, 'Sleep Routine', 'prepare');
  }

  // Rule 4: Low Physical Activity -> Movement
  if (latestCheckIn && latestCheckIn.physicalActivityMinutes < 20) {
    add(afternoon, 'Light Movement', 'Your recent physical activity is on the lower side; a short walk or stretch can help.', 10, 'Movement', 'walk');
  } else {
    // General Afternoon Focus
    add(afternoon, 'Focus Break', 'Break up the afternoon to maintain mental clarity.', 5, 'Music', 'focus');
  }

  // Rule 5: Evening Transition
  add(evening, 'Evening Transition', 'Transition out of the workday to signal your body to unwind.', 10, 'Relaxation', 'progressive');

  // Rule 6: High Screen Time -> Screen-free night
  if (latestWellbeing && latestWellbeing.night_screen_time_minutes > 30) {
    add(night, 'Screen-Free Wind-Down', 'Your recent night screen time is above your usual pattern.', 30, 'Sleep Routine', 'screen-free');
  } else {
    add(night, 'Calm Night Routine', 'End the day quietly to prepare for rest.', 15, 'Music', 'calming');
  }

  // Cap arrays at 3 items max
  morning = morning.slice(0, 3);
  afternoon = afternoon.slice(0, 3);
  evening = evening.slice(0, 3);
  night = night.slice(0, 3);

  const summaryText = personalizationLimited 
    ? "Your personal pattern is still being learned. Today's plan uses the information currently available."
    : "Today's plan is shaped by your recent sleep, stress, screen-time pattern, and personal baseline.";

  const newRoadmap = new Roadmap({
    user: userId,
    date: today,
    summaryText,
    morning,
    afternoon,
    evening,
    night
  });

  return await newRoadmap.save();
};
