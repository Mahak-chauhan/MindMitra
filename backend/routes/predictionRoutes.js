const express = require('express');
const router = express.Router();
const controller = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, controller.createPrediction);
router.get('/', protect, controller.getPredictions); // Changed to '/' using req.user._id

module.exports = router;
