const CheckIn = require('../models/CheckIn');
const DigitalWellbeing = require('../models/DigitalWellbeing');

const MIN_HISTORY = 7;

exports.calculateBaseline = async (userId, currentCheckIn) => {
  const history = await CheckIn.find({ 
    user: userId,
    _id: { $ne: currentCheckIn._id } 
  }).sort({ date: -1 }).limit(30);

  if (history.length < MIN_HISTORY) {
    return {
      status: 'insufficient_data',
      message: `Baseline not established yet. (${history.length}/${MIN_HISTORY} check-ins)`
    };
  }

  const avgSleep = history.reduce((sum, c) => sum + (c.sleepDuration || 0), 0) / history.length;
  const avgStress = history.reduce((sum, c) => sum + (c.stressLevel || 0), 0) / history.length;
  const avgActivity = history.reduce((sum, c) => sum + (c.physicalActivityMinutes || 0), 0) / history.length;

  const getComparison = (current, avg, threshold, inverse = false) => {
    if (current === undefined || current === null) return "not recorded";
    const diff = current - avg;
    if (Math.abs(diff) <= threshold) return "close to your usual pattern";
    if (diff > threshold) return inverse ? "above your usual pattern (worse)" : "above your usual pattern";
    return inverse ? "below your usual pattern (better)" : "below your usual pattern";
  };

  return {
    status: 'established',
    metrics: {
      sleep: getComparison(currentCheckIn.sleepDuration, avgSleep, 1),
      stress: getComparison(currentCheckIn.stressLevel, avgStress, 1.5, true),
      activity: getComparison(currentCheckIn.physicalActivityMinutes, avgActivity, 15)
    }
  };
};

exports.calculateWellbeingBaseline = async (userId, currentRecord) => {
  const history = await DigitalWellbeing.find({ 
    user: userId,
    _id: { $ne: currentRecord._id } 
  }).sort({ date: -1 }).limit(30);

  if (history.length < MIN_HISTORY) {
    return {
      status: 'insufficient_data',
      message: `Baseline not established yet. (${history.length}/${MIN_HISTORY} records)`
    };
  }

  const avgScreenTime = history.reduce((sum, c) => sum + (c.total_screen_time_hours || 0), 0) / history.length;
  const avgSocialMedia = history.reduce((sum, c) => sum + (c.social_media_minutes || 0), 0) / history.length;
  const avgNightScreen = history.reduce((sum, c) => sum + (c.night_screen_time_minutes || 0), 0) / history.length;

  const getComparison = (current, avg, threshold) => {
    if (current === undefined || current === null) return "not recorded";
    const diff = current - avg;
    if (Math.abs(diff) <= threshold) return "close to your usual pattern";
    if (diff > threshold) return "above your usual pattern";
    return "below your usual pattern";
  };

  return {
    status: 'established',
    metrics: {
      screenTime: getComparison(currentRecord.total_screen_time_hours, avgScreenTime, 1.0),
      socialMedia: getComparison(currentRecord.social_media_minutes, avgSocialMedia, 30),
      nightScreenTime: getComparison(currentRecord.night_screen_time_minutes, avgNightScreen, 15)
    }
  };
};
