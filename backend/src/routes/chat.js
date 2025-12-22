const express = require('express');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message to AI coach
router.post('/message', auth, chatController.sendMessage);

// Get chat history
router.get('/history', auth, chatController.getChatHistory);

module.exports = router;