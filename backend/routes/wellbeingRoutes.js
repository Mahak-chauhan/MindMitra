const express = require('express');
const router = express.Router();
const controller = require('../controllers/wellbeingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, controller.createWellbeingRecord);
router.get('/', protect, controller.getWellbeingRecords);
router.get('/:id', protect, controller.getWellbeingRecordById);
router.delete('/:id', protect, controller.deleteWellbeingRecord);

module.exports = router;
