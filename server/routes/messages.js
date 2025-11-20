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

module.exports = router;
