const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: mongoose.Schema.Types.ObjectId, ref: 'CheckIn' },
  date: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  confidence: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
  contributingFactors: [{
    feature: String,
    impact: String,
    value: Number
  }],
  provenance: {
    type: Map,
    of: String,
    default: {}
  },
  dataQuality: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);

