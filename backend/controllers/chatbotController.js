const chatbotService = require('../services/chatbotService');

exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message is too long' });
    }
    
    const reply = await chatbotService.processMessage(req.user._id, message);
    res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await chatbotService.getHistory(req.user._id);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};
