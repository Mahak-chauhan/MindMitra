const mongoose = require('mongoose');

const moodDiarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  mood: { type: String, required: true },
  intensity: { type: Number, min: 1, max: 10 },
  note: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('MoodDiary', moodDiarySchema);
