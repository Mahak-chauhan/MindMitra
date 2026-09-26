const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  sleepDuration: { type: Number, required: true, min: 0, max: 24 },
  sleepQuality: { type: Number, min: 1, max: 10, default: 7 },
  stressLevel: { type: Number, required: true, min: 1, max: 10 },
  mood: { type: String, required: true },
  energyLevel: { type: String },
  physicalActivityMinutes: { type: Number, min: 0, default: 0 },
  nightScreenTimeMinutes: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
