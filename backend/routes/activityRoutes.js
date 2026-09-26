const express = require('express');
const router = express.Router();
const controller = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, controller.getCatalog);
router.get('/recommendations', protect, controller.getRecommendations);
router.post('/:id/start', protect, controller.startActivity);
router.post('/history/:logId/complete', protect, controller.completeActivity);
router.get('/history', protect, controller.getHistory);

module.exports = router;
