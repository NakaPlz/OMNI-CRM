const express = require('express');
const router = express.Router();
const { sendInstagramMessage } = require('../services/meta');

router.post('/send', async (req, res) => {
    const { recipientId, text, platform } = req.body;

    if (!recipientId || !text || !platform) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let result;
        if (platform === 'instagram') {
            result = await sendInstagramMessage(recipientId, text);
        } else {
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

router.post('/bulk', async (req, res) => {
    const { recipients, text } = req.body;

    if (!recipients || !Array.isArray(recipients) || !text) {
        return res.status(400).json({ error: 'Invalid request body. Expected recipients array and text.' });
    }

    const results = {
        successful: [],
        failed: []
    };

    // Process in parallel but limit concurrency if needed (for now, simple Promise.all)
    // Or sequential to avoid rate limits? Instagram has rate limits.
    // Let's do sequential for safety for now.

    for (const recipient of recipients) {
        try {
            if (recipient.platform === 'instagram') {
                await sendInstagramMessage(recipient.id, text);
                results.successful.push(recipient.id);
            } else {
                results.failed.push({ id: recipient.id, error: 'Unsupported platform' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            console.error(`Failed to send to ${recipient.id}:`, errorMessage);
            results.failed.push({ id: recipient.id, error: errorMessage });
        }
    }

    res.json({ success: true, results });
});

module.exports = router;
