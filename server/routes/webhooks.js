const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory storage for settings (in a real app, use a DB)
let forwardingConfig = {
    enabled: true,
    url: process.env.N8N_WEBHOOK_URL || ''
};

// Meta Webhook Verification
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // You should set a verify token in your .env
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'risut_crm_token';

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Receive Webhook Events
router.post('/', async (req, res) => {
    const body = req.body;

    console.log('Received webhook event:', JSON.stringify(body, null, 2));

    // Forward to n8n if enabled
    if (forwardingConfig.enabled && forwardingConfig.url) {
        try {
            console.log(`Forwarding to ${forwardingConfig.url}...`);
            await axios.post(forwardingConfig.url, body);
            console.log('Forwarding successful');
        } catch (error) {
            console.error('Error forwarding webhook:', error.message);
        }
    }

    // Process the message (Here we would save to DB and emit to socket.io for frontend)
    if (req.io) {
        console.log('Emitting new_message event to clients');
        req.io.emit('new_message', body);
    }

    // Return 200 to Meta immediately
    res.status(200).send('EVENT_RECEIVED');
});

// Endpoint to update forwarding config (called from Frontend Settings)
router.post('/config', (req, res) => {
    const { enabled, url } = req.body;
    forwardingConfig = { enabled, url };
    console.log('Updated forwarding config:', forwardingConfig);
    res.json({ success: true, config: forwardingConfig });
});

module.exports = router;
