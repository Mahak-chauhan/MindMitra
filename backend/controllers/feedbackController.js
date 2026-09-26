const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res, next) => {
  try {
    const feedback = new Feedback(req.body);
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
