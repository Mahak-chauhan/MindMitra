const express = require('express');
const router = express.Router();
const controller = require('../controllers/checkinController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, controller.createCheckIn);
router.get('/', protect, controller.getCheckIns);
router.get('/:id', protect, controller.getCheckInById);

module.exports = router;
