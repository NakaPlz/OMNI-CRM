const express = require('express');
const axios = require('axios');
const router = express.Router();
const chatService = require('../services/chatService');

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

    // Process the message and emit to socket.io
    if (req.io) {
        console.log('Processing webhook for socket emission...');

        let normalizedMessage = null;

        // Handle Instagram Payload
        if (body.object === 'instagram' && body.entry && body.entry[0].messaging) {
            const messagingEvent = body.entry[0].messaging[0];
            if (messagingEvent.message && messagingEvent.message.text) {
                // Check if the message is from us (echo)
                const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID || '17841477975633269';
                const isFromMe = messagingEvent.sender.id === instagramAccountId;

                normalizedMessage = {
                    platform: 'instagram',
                    // If it's from us, the "chat" is with the recipient. If from user, "chat" is with sender.
                    senderId: isFromMe ? messagingEvent.recipient.id : messagingEvent.sender.id,
                    text: messagingEvent.message.text,
                    timestamp: Math.floor(messagingEvent.timestamp / 1000), // Convert from ms to seconds
                    messageId: messagingEvent.message.mid,
                    sender: isFromMe ? 'me' : 'user'
                };
            }
        }

        // Handle WhatsApp Payload
        else if (body.object === 'whatsapp_business_account' && body.entry && body.entry[0].changes) {
            const change = body.entry[0].changes[0].value;
            if (change.messages && change.messages[0]) {
                const msg = change.messages[0];
                if (msg.type === 'text') {
                    normalizedMessage = {
                        platform: 'whatsapp',
                        senderId: msg.from, // This is the Phone Number
                        text: msg.text.body,
                        timestamp: msg.timestamp,
                        messageId: msg.id,
                        senderName: change.contacts ? change.contacts[0].profile.name : msg.from
                    };
                }
            }
        }

        if (normalizedMessage) {
            console.log('Emitting new_message event:', normalizedMessage);
            req.io.emit('new_message', normalizedMessage);

            // Save to database
            try {
                // Save or update chat
                await chatService.createOrUpdateChat({
                    chat_id: normalizedMessage.senderId,
                    name: normalizedMessage.senderName || `User ${normalizedMessage.senderId.slice(-4)}`,
                    source: normalizedMessage.platform,
                    last_message: normalizedMessage.text,
                    last_message_timestamp: normalizedMessage.timestamp,
                    avatar: `https://ui-avatars.com/api/?name=${normalizedMessage.platform}&background=random`
                });

                // Save message
                await chatService.createMessage({
                    message_id: normalizedMessage.messageId,
                    chat_id: normalizedMessage.senderId,
                    text: normalizedMessage.text,
                    sender: normalizedMessage.sender,
                    timestamp: normalizedMessage.timestamp,
                    source: normalizedMessage.platform
                });

                console.log('Message and chat saved to database');
            } catch (dbError) {
                console.error('Error saving to database:', dbError);
                // Don't fail the webhook if database save fails
            }
        } else {
            console.log('Webhook received but could not parse as a text message (might be status update or unsupported type).');
            // Still emit raw for debugging if needed, or just ignore
            // req.io.emit('raw_webhook', body); 
        }
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
