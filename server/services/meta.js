const axios = require('axios');

const sendInstagramMessage = async (recipientId, text) => {
    // User explicitly requested this URL and Token
    const token = process.env.META_ACCESS_TOKEN || 'IGAAVFwYY1nqhBZAFIybExPYU9MMkZAvcHBmWE9LSGJBeUtBbWd1ZAzJIVFEybThnWTY0T080OThrV3Y0U2QzVWE4S2xIczdnY0lPWVFjQmpjNnh3R1VmM0M0dURING50ZAF9nQkJGSWl2OEFfNGlMcXNDXzRuaXhqLUhFcWFLOUlCawZDZD';
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID || '17841477975633269';

    // Using graph.instagram.com as explicitly requested by user
    const url = `https://graph.instagram.com/v24.0/${accountId}/messages`;

    const payload = {
        recipient: { id: recipientId },
        message: { text: text }
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending Instagram message:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = {
    sendInstagramMessage,
    sendFacebookMessage
};

const sendFacebookMessage = async (recipientId, text) => {
    const token = process.env.META_ACCESS_TOKEN;
    const pageId = '848450948341876'; // Provided by user
    const url = `https://graph.facebook.com/v18.0/${pageId}/messages`;

    const payload = {
        recipient: { id: recipientId },
        message: { text: text },
        messaging_type: "RESPONSE"
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending Facebook message:', error.response ? error.response.data : error.message);
        throw error;
    }
};
