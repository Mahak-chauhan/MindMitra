const WellnessActivity = require('../models/WellnessActivity');
const UserActivity = require('../models/UserActivity');
const recommendationService = require('../services/activityRecommendationService');

exports.getCatalog = async (req, res, next) => {
  try {
    const activities = await WellnessActivity.find({ active: true });
    res.status(200).json(activities);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await recommendationService.getRecommendations(req.user._id);
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.startActivity = async (req, res, next) => {
  try {
    const activityId = req.params.id;
    const activity = await WellnessActivity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    const userActivity = new UserActivity({
      user: req.user._id,
      activity: activityId,
      status: 'Started'
    });
    
    const saved = await userActivity.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.completeActivity = async (req, res, next) => {
  try {
    const logId = req.params.logId;
    const { rating } = req.body;
    
    const userActivity = await UserActivity.findById(logId);
    if (!userActivity) {
      return res.status(404).json({ error: 'Activity log not found' });
    }
    
    if (userActivity.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    userActivity.status = 'Completed';
    userActivity.completedAt = Date.now();
    if (rating && rating >= 1 && rating <= 5) {
      userActivity.rating = rating;
    }
    
    const updated = await userActivity.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await UserActivity.find({ user: req.user._id })
      .populate('activity')
      .sort({ startedAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
