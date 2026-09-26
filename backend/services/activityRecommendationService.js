const WellnessActivity = require('../models/WellnessActivity');
const CheckIn = require('../models/CheckIn');
const DigitalWellbeing = require('../models/DigitalWellbeing');

exports.getRecommendations = async (userId) => {
  try {
    // Fetch user context
    const latestCheckIn = await CheckIn.findOne({ user: userId }).sort({ date: -1 });
    const latestWellbeing = await DigitalWellbeing.findOne({ user: userId }).sort({ date: -1 });
    
    // Fetch all active activities
    const allActivities = await WellnessActivity.find({ active: true });
    
    if (!allActivities.length) return [];
    
    // Filter activities by simple rule-based logic
    let suggestedCategories = [];
    
    if (!latestCheckIn) {
      // Insufficient data fallback
      suggestedCategories = ['Breathing', 'Meditation', 'Movement'];
    } else {
      const { stressLevel, sleepDuration, physicalActivityMinutes } = latestCheckIn;
      
      if (stressLevel >= 7) {
        suggestedCategories.push('Breathing', 'Relaxation');
      }
      if (sleepDuration < 6) {
        suggestedCategories.push('Sleep Routine', 'Relaxation');
      }
      if (physicalActivityMinutes < 20) {
        suggestedCategories.push('Movement');
      }
      
      // If digital usage is high
      if (latestWellbeing && latestWellbeing.total_screen_time_hours > 6) {
        suggestedCategories.push('Meditation', 'Music');
      }
    }
    
    // If no specific rules hit, show general categories
    if (suggestedCategories.length === 0) {
      suggestedCategories = ['Meditation', 'Music', 'Breathing'];
    }
    
    // Filter the catalog
    const recommendations = allActivities.filter(a => suggestedCategories.includes(a.category));
    
    // Shuffle and pick up to 3 recommendations
    return recommendations.sort(() => 0.5 - Math.random()).slice(0, 3);
  } catch (err) {
    console.error('Recommendation logic failed', err);
    return []; // Return empty gracefully
  }
};
