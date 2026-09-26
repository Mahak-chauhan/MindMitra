const mongoose = require('mongoose');

const digitalWellbeingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  total_screen_time_hours: { type: Number, required: true, min: 0, max: 24 },
  social_media_minutes: { type: Number, required: true, min: 0, max: 1440 },
  night_screen_time_minutes: { type: Number, required: true, min: 0, max: 1440 },
  most_used_category: { 
    type: String, 
    enum: ['Social', 'Entertainment', 'Education', 'Work', 'Communication', 'Other'],
    default: 'Other'
  },
  most_used_app: { type: String, trim: true },
  notes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('DigitalWellbeing', digitalWellbeingSchema);
