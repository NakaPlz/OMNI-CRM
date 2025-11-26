const axios = require('axios');

const sendInstagramMessage = async (recipientId, text) => {
    // User explicitly requested this URL and Token
    const token = process.env.META_ACCESS_TOKEN || 'IGAAVFwYY1nqhBZAFFvaGdUU0lFd3RwaUkwVjRWb2hFT0ZAkMUpWbDZA2TjVMU2syaG9udU4zR1MzYkhmS3V2MmNUY25MWnBMb040YWwySW5EUlVYaTZAPTGxpc202cTFScGViNm1vNlZA2cmh3Sk1VOFFRejdfVldZARGpHQlNSRnBEWQZDZD';
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
    sendInstagramMessage
};
