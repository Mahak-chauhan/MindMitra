const Roadmap = require('../models/Roadmap');
const roadmapService = require('../services/roadmapService');

exports.generateRoadmap = async (req, res, next) => {
  try {
    const roadmap = await roadmapService.generateRoadmap(req.user._id);
    res.status(201).json(roadmap);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getTodayRoadmap = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const roadmap = await Roadmap.findOne({ user: req.user._id, date: today })
      .populate('morning.activityId')
      .populate('afternoon.activityId')
      .populate('evening.activityId')
      .populate('night.activityId');
      
    if (!roadmap) {
      return res.status(200).json({ status: 'not_generated_yet' });
    }
    
    res.status(200).json({ status: 'generated', roadmap });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getRoadmapHistory = async (req, res, next) => {
  try {
    const history = await Roadmap.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30)
      .select('-morning -afternoon -evening -night'); // Lightweight
      
    res.status(200).json(history);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.completeItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Find item across all blocks
    let itemFound = false;
    ['morning', 'afternoon', 'evening', 'night'].forEach(block => {
      const item = roadmap[block].id(itemId);
      if (item) {
        item.isCompleted = true;
        itemFound = true;
      }
    });
    
    if (!itemFound) {
      return res.status(404).json({ error: 'Item not found in roadmap' });
    }
    
    await roadmap.save();
    res.status(200).json({ success: true, message: 'Item marked as completed' });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
