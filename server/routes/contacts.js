const express = require('express');
const router = express.Router();
const contactService = require('../services/supabaseContactService');

// Get all contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await contactService.getAllContacts();
        res.json({ success: true, contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single contact by ID
router.get('/:id', async (req, res) => {
    try {
        const contact = await contactService.getContactById(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, error: 'Contact not found' });
        }
        res.json({ success: true, contact });
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get contact by chat ID
router.get('/chat/:chatId', async (req, res) => {
    try {
        const contact = await contactService.getContactByChatId(req.params.chatId);
        res.json({ success: true, contact: contact || null });
    } catch (error) {
        console.error('Error fetching contact by chat ID:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new contact
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, company, notes, source, chatId } = req.body;

        if (!name || !source || !chatId) {
            return res.status(400).json({
                success: false,
                error: 'Name, source, and chatId are required'
            });
        }

        const contact = await contactService.createContact({
            chat_id: chatId,
            name,
            email,
            phone,
            company,
            notes,
            source
        });

        res.status(201).json({ success: true, contact });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update contact
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, company, notes } = req.body;
        const contact = await contactService.updateContact(req.params.id, {
            name, email, phone, company, notes
        });
        res.json({ success: true, contact });
    } catch (error) {
        console.error('Error updating contact:', error);
        if (error.message === 'Contact not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete contact
router.delete('/:id', async (req, res) => {
    try {
        await contactService.deleteContact(req.params.id);
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        if (error.message === 'Contact not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
