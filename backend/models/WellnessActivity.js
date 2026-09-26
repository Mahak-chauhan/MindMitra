const mongoose = require('mongoose');

const wellnessActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Breathing', 'Meditation', 'Movement', 'Relaxation', 'Music', 'Sleep Routine']
  },
  duration_minutes: { type: Number, required: true },
  description: { type: String, required: true },
  instructions: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WellnessActivity', wellnessActivitySchema);
