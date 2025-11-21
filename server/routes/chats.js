const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

// Get all chats
router.get('/', async (req, res) => {
    try {
        const chats = await chatService.getAllChats();
        res.json({ success: true, chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get messages for a specific chat
router.get('/:chatId/messages', async (req, res) => {
    try {
        const messages = await chatService.getMessagesByChatId(req.params.chatId);
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
