const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  reason: { type: String, required: true },
  duration_minutes: { type: Number },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'WellnessActivity' },
  isCompleted: { type: Boolean, default: false }
});

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // Store midnight date to prevent duplicates
  generatedAt: { type: Date, default: Date.now },
  summaryText: { type: String, required: true },
  morning: [roadmapItemSchema],
  afternoon: [roadmapItemSchema],
  evening: [roadmapItemSchema],
  night: [roadmapItemSchema]
}, { timestamps: true });

// Ensure only one roadmap per user per day
roadmapSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
