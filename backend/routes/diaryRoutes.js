const express = require('express');
const router = express.Router();
const controller = require('../controllers/diaryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, controller.createDiaryEntry);
router.get('/', protect, controller.getDiaryEntries);
router.get('/:id', protect, controller.getDiaryEntryById);
router.delete('/:id', protect, controller.deleteDiaryEntry);

module.exports = router;
