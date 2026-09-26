const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  insightType: { type: String, required: true }, // e.g., 'Prediction', 'Roadmap'
  insightId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isUseful: { type: Boolean, required: true },
  comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
