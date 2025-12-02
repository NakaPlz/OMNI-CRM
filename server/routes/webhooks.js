const express = require('express');
const axios = require('axios');
const router = express.Router();
const chatService = require('../services/chatService');
const verifySignature = require('../middleware/verifySignature');

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
router.post('/', verifySignature, async (req, res) => {
    const body = req.body;

    console.log('Received webhook event:', JSON.stringify(body, null, 2));

    // Forward to n8n if enabled (SKIP for Facebook Page events)
    if (forwardingConfig.enabled && forwardingConfig.url && body.object !== 'page') {
        try {
            console.log(`Forwarding to ${forwardingConfig.url}...`);
            await axios.post(forwardingConfig.url, body);
            console.log('Forwarding successful');
        } catch (error) {
            console.error('Error forwarding webhook:', error.message);
        }
    } else if (body.object === 'page') {
        console.log('Skipping n8n forwarding for Facebook Page event.');
    }

    // Process the message and emit to socket.io
    if (req.io) {
        console.log('Processing webhook for socket emission...');

        let normalizedMessage = null;

        // Handle Instagram Payload
        if (body.object === 'instagram' && body.entry && body.entry[0].messaging) {
            const messagingEvent = body.entry[0].messaging[0];
            if (messagingEvent.message) {
                // Check if the message is from us (echo)
                const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID || '17841477975633269';
                const isFromMe = messagingEvent.sender.id === instagramAccountId;

                let messageType = 'text';
                let messageText = messagingEvent.message.text || '';
                let mediaUrl = null;

                // Check for attachments (audio, image, etc.)
                if (messagingEvent.message.attachments && messagingEvent.message.attachments.length > 0) {
                    const attachment = messagingEvent.message.attachments[0];
                    if (attachment.type === 'audio') {
                        messageType = 'audio';
                        mediaUrl = attachment.payload.url;
                        messageText = 'Audio Message';
                    }
                }

                if (messageText || mediaUrl) {
                    normalizedMessage = {
                        platform: 'instagram',
                        // If it's from us, the "chat" is with the recipient. If from user, "chat" is with sender.
                        senderId: isFromMe ? messagingEvent.recipient.id : messagingEvent.sender.id,
                        text: messageText,
                        timestamp: Math.floor(messagingEvent.timestamp / 1000), // Convert from ms to seconds
                        messageId: messagingEvent.message.mid,
                        sender: isFromMe ? 'me' : 'user',
                        type: messageType,
                        media_url: mediaUrl
                    };
                }
            }
        }

        // Handle WhatsApp Payload
        else if (body.object === 'whatsapp_business_account' && body.entry && body.entry[0].changes) {
            const change = body.entry[0].changes[0].value;
            if (change.messages && change.messages[0]) {
                const msg = change.messages[0];

                let messageType = 'text';
                let messageText = '';
                let mediaUrl = null;

                if (msg.type === 'text') {
                    messageText = msg.text.body;
                } else if (msg.type === 'audio' || msg.type === 'voice') {
                    messageType = 'audio';
                    messageText = 'Audio Message';
                    // WhatsApp provides an ID, we would need to fetch the media URL. 
                    // For now, we'll store the ID as the URL or handle it later.
                    // Ideally, we fetch it from Meta API.
                    mediaUrl = msg.audio ? msg.audio.id : (msg.voice ? msg.voice.id : null);
                }

                if (messageText || mediaUrl) {
                    normalizedMessage = {
                        platform: 'whatsapp',
                        senderId: msg.from, // This is the Phone Number
                        text: messageText,
                        timestamp: msg.timestamp,
                        messageId: msg.id,
                        senderName: change.contacts ? change.contacts[0].profile.name : msg.from,
                        type: messageType,
                        media_url: mediaUrl
                    };
                }
            }
        }

        // Handle Facebook Page Payload
        else if (body.object === 'page' && body.entry && body.entry[0].messaging) {
            const messagingEvent = body.entry[0].messaging[0];
            if (messagingEvent.message) {
                // Check if the message is from us (echo) - Page ID is sender
                const pageId = '848450948341876';
                const isFromMe = messagingEvent.sender.id === pageId;

                // Skip if it is an echo from us (unless we want to store our own replies sent from FB directly)
                // For now, let's treat it similar to Instagram

                let messageType = 'text';
                let messageText = messagingEvent.message.text || '';
                let mediaUrl = null;

                // Check for attachments
                if (messagingEvent.message.attachments && messagingEvent.message.attachments.length > 0) {
                    const attachment = messagingEvent.message.attachments[0];
                    if (attachment.type === 'audio') {
                        messageType = 'audio';
                        mediaUrl = attachment.payload.url;
                        messageText = 'Audio Message';
                    }
                }

                if (messageText || mediaUrl) {
                    normalizedMessage = {
                        platform: 'facebook',
                        senderId: isFromMe ? messagingEvent.recipient.id : messagingEvent.sender.id,
                        text: messageText,
                        timestamp: Math.floor(messagingEvent.timestamp / 1000),
                        messageId: messagingEvent.message.mid,
                        sender: isFromMe ? 'me' : 'user',
                        type: messageType,
                        media_url: mediaUrl
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
                    source: normalizedMessage.platform,
                    type: normalizedMessage.type,
                    media_url: normalizedMessage.media_url
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
