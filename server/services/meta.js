const axios = require('axios');

const META_API_VERSION = 'v21.0';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
// Use the provided ID as default if env var is missing
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || '17841477975633269';

const sendInstagramMessage = async (recipientId, text) => {
    if (!META_ACCESS_TOKEN) {
        throw new Error('META_ACCESS_TOKEN is not configured');
    }

    if (!INSTAGRAM_ACCOUNT_ID) {
        throw new Error('INSTAGRAM_ACCOUNT_ID is not configured');
    }

    // Use the Instagram Business Account ID in the URL
    const url = `https://graph.facebook.com/${META_API_VERSION}/${INSTAGRAM_ACCOUNT_ID}/messages`;

    const payload = {
        recipient: { id: recipientId },
        message: { text: text }
    };

    try {
        const response = await axios.post(url, payload, {
            params: { access_token: META_ACCESS_TOKEN }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending Instagram message:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = {
    sendInstagramMessage
};
