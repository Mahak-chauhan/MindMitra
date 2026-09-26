const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('profile');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user.profile || {});
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Apply updates safely (mongoose validation will catch invalid enum/ranges on save)
    // We only take valid keys defined in the profile schema
    const allowedKeys = [
      'age', 'gender', 'occupation', 'work_type', 'work_hours_per_day', 
      'commute_time_minutes', 'bedtime', 'wakeup_time', 'workout_type'
    ];
    
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        if (!user.profile) user.profile = {};
        user.profile[key] = updates[key];
      }
    }

    await user.save();
    
    res.status(200).json(user.profile);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(400);
    next(error);
  }
};
