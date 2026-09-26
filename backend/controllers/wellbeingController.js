const DigitalWellbeing = require('../models/DigitalWellbeing');

exports.createWellbeingRecord = async (req, res, next) => {
  try {
    const { 
      total_screen_time_hours, 
      social_media_minutes, 
      night_screen_time_minutes, 
      most_used_category, 
      most_used_app, 
      notes 
    } = req.body;

    // Validate boundaries (handled by Mongoose mostly, but doing explicit 400 for clarity)
    if (total_screen_time_hours < 0 || total_screen_time_hours > 24) {
      return res.status(400).json({ error: 'Screen time hours must be between 0 and 24' });
    }
    if (social_media_minutes < 0 || social_media_minutes > 1440) {
      return res.status(400).json({ error: 'Social media minutes must be between 0 and 1440' });
    }
    if (night_screen_time_minutes < 0 || night_screen_time_minutes > 1440) {
      return res.status(400).json({ error: 'Night screen time minutes must be between 0 and 1440' });
    }

    const record = new DigitalWellbeing({
      user: req.user._id,
      total_screen_time_hours,
      social_media_minutes,
      night_screen_time_minutes,
      most_used_category,
      most_used_app,
      notes
    });

    const savedRecord = await record.save();

    const baselineService = require('../services/baselineService');
    const baseline = await baselineService.calculateWellbeingBaseline(req.user._id, savedRecord);

    res.status(201).json({
      success: true,
      record: savedRecord,
      baseline
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getWellbeingRecords = async (req, res, next) => {
  try {
    const records = await DigitalWellbeing.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getWellbeingRecordById = async (req, res, next) => {
  try {
    const record = await DigitalWellbeing.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.deleteWellbeingRecord = async (req, res, next) => {
  try {
    const record = await DigitalWellbeing.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await record.deleteOne();
    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
