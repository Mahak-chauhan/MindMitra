const MoodDiary = require('../models/MoodDiary');

exports.createDiaryEntry = async (req, res, next) => {
  try {
    const { mood, note, intensity } = req.body;
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }
    const diary = new MoodDiary({
      user: req.user._id,
      mood,
      note,
      intensity
    });
    const savedDiary = await diary.save();
    res.status(201).json(savedDiary);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getDiaryEntries = async (req, res, next) => {
  try {
    const entries = await MoodDiary.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getDiaryEntryById = async (req, res, next) => {
  try {
    const entry = await MoodDiary.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Diary entry not found' });
    }
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.deleteDiaryEntry = async (req, res, next) => {
  try {
    const entry = await MoodDiary.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Diary entry not found' });
    }
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await entry.deleteOne();
    res.status(200).json({ success: true, message: 'Diary entry deleted' });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
