const Prediction = require('../models/Prediction');
const mlService = require('../services/mlService');

exports.createPrediction = async (req, res, next) => {
  try {
    const { checkIn, features, target } = req.body;
    
    // Auth middleware attaches req.user
    const userId = req.user._id;
    
    if (!features) {
        return res.status(400).json({ error: "Missing features object in request body." });
    }

    // Call ML service
    let mlResponse;
    try {
        mlResponse = await mlService.getPrediction(features, target || 'felt_rested');
    } catch (mlError) {
        return res.status(503).json({ error: "ML Service unavailable or returned an error.", details: mlError.message });
    }

    // Map top SHAP contributions
    const topFactors = mlResponse.ranked_contributions.slice(0, 5).map(c => ({
        feature: c.feature,
        impact: c.direction,
        value: c.contribution
    }));

    const prediction = new Prediction({
        user: userId,
        checkIn: checkIn,
        score: mlResponse.prediction,
        confidence: 'High',
        contributingFactors: topFactors
    });
    
    // Save to DB
    const savedPrediction = await prediction.save();
    
    res.status(201).json({
        success: true,
        data: mlResponse,
        dbRecord: savedPrediction
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getPredictions = async (req, res, next) => {
  try {
    // Only return predictions for the authenticated user
    const predictions = await Prediction.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(predictions);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
