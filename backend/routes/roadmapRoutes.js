const express = require('express');
const router = express.Router();
const controller = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, controller.generateRoadmap);
router.get('/today', protect, controller.getTodayRoadmap);
router.get('/history', protect, controller.getRoadmapHistory);
router.patch('/:id/items/:itemId/complete', protect, controller.completeItem);

module.exports = router;
