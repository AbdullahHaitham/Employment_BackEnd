const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

router.post('/ask', protect, askAI); // /api/chat/ask

module.exports = router;
