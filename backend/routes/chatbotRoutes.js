const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, controller.sendMessage);
router.get('/history', protect, controller.getHistory);

module.exports = router;
