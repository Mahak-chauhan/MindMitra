const CheckIn = require('../models/CheckIn');
const Prediction = require('../models/Prediction');
const DigitalWellbeing = require('../models/DigitalWellbeing');
const Roadmap = require('../models/Roadmap');
const UserActivity = require('../models/UserActivity');

exports.buildUserContext = async (userId) => {
  const context = {};

  try {
    // Latest CheckIn
    const latestCheckIn = await CheckIn.findOne({ user: userId }).sort({ date: -1 }).select('-user -__v');
    if (latestCheckIn) context.latestCheckIn = latestCheckIn;

    // Latest Prediction
    if (latestCheckIn) {
      const latestPrediction = await Prediction.findOne({ checkIn: latestCheckIn._id }).select('score contributingFactors');
      if (latestPrediction) context.latestPrediction = latestPrediction;
    }

    // Latest Digital Wellbeing
    const latestWellbeing = await DigitalWellbeing.findOne({ user: userId }).sort({ date: -1 }).select('total_screen_time_hours social_media_minutes night_screen_time_minutes');
    if (latestWellbeing) context.latestDigitalWellbeing = latestWellbeing;

    // Today's Roadmap
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRoadmap = await Roadmap.findOne({ user: userId, date: today }).select('summaryText morning afternoon evening night');
    if (todayRoadmap) context.todayRoadmap = todayRoadmap;

    // Recent Activity History
    const recentActivities = await UserActivity.find({ user: userId, status: 'Completed' })
      .sort({ completedAt: -1 })
      .limit(3)
      .populate('activity', 'title category');
    
    if (recentActivities.length > 0) {
      context.recentCompletedActivities = recentActivities.map(a => ({
        title: a.activity?.title,
        category: a.activity?.category,
        rating: a.rating
      }));
    }

    return context;
  } catch (error) {
    console.error('Context builder error:', error);
    return { error: 'Failed to build full context' };
  }
};
