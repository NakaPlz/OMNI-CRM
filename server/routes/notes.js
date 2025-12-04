const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

// Get notes for a chat
router.get('/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const notes = await chatService.getNotes(chatId);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Add a note
router.post('/', async (req, res) => {
    try {
        const { chatId, content } = req.body;
        if (!chatId || !content) {
            return res.status(400).json({ error: 'Missing chatId or content' });
        }
        const note = await chatService.addNote(chatId, content);
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// Delete a note
router.delete('/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        await chatService.deleteNote(noteId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router;
