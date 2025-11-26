const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/', requireAuth, async (req, res) => {
    try {
        // 1. Total Contacts
        const { count: contactsCount, error: contactsError } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true });

        if (contactsError) throw contactsError;

        // 2. Total Chats
        const { count: chatsCount, error: chatsError } = await supabase
            .from('chats')
            .select('*', { count: 'exact', head: true });

        if (chatsError) throw chatsError;

        // 3. Total Messages
        const { count: messagesCount, error: messagesError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true });

        if (messagesError) throw messagesError;

        // 4. Chats by Platform (WhatsApp vs Instagram)
        const { data: platformData, error: platformError } = await supabase
            .from('chats')
            .select('source');

        if (platformError) throw platformError;

        const platformStats = platformData.reduce((acc, chat) => {
            const source = chat.source || 'unknown';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            stats: {
                totalContacts: contactsCount || 0,
                totalChats: chatsCount || 0,
                totalMessages: messagesCount || 0,
                platformDistribution: platformStats
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
