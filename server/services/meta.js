const axios = require('axios');

const META_API_VERSION = 'v18.0';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

const sendInstagramMessage = async (recipientId, text) => {
    if (!META_ACCESS_TOKEN) {
        throw new Error('META_ACCESS_TOKEN is not configured');
    }

    const url = `https://graph.facebook.com/${META_API_VERSION}/me/messages`;

    // For Instagram, we usually send to the conversation ID or user ID depending on the entry point.
    // Assuming recipientId is the IGSID (Instagram Scoped User ID).

    const payload = {
        recipient: { id: recipientId },
        message: { text: text },
        access_token: META_ACCESS_TOKEN
    };

    try {
        const response = await axios.post(url, payload);
        return response.data;
    } catch (error) {
        console.error('Error sending Instagram message:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = {
    sendInstagramMessage
};
