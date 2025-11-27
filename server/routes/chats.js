const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);

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

// Delete a chat
router.delete('/:chatId', async (req, res) => {
    try {
        await chatService.deleteChat(req.params.chatId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add tag to chat
router.post('/:chatId/tags', async (req, res) => {
    try {
        const { tagId } = req.body;
        if (!tagId) {
            return res.status(400).json({ success: false, error: 'Tag ID is required' });
        }
        await chatService.addTagToChat(req.params.chatId, tagId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding tag:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove tag from chat
router.delete('/:chatId/tags/:tagId', async (req, res) => {
    try {
        await chatService.removeTagFromChat(req.params.chatId, req.params.tagId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing tag:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
