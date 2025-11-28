const axios = require('axios');

const url = 'http://localhost:3000/api/webhooks';
const data = {
    object: 'instagram',
    entry: [{
        id: '17841400000000000',
        time: 1679000000000,
        messaging: [{
            sender: { id: '1234567890123456' },
            recipient: { id: '17841477975633269' },
            timestamp: 1679000000000,
            message: {
                mid: 'm_mid.1234567890123456',
                text: 'Hello from Instagram Test Script'
            }
        }]
    }]
};

console.log('Sending Instagram webhook event...');
axios.post(url, data)
    .then(res => {
        console.log('Status:', res.status);
        console.log('Data:', res.data);
        if (res.data === 'EVENT_RECEIVED') {
            console.log('SUCCESS: Event received');
        } else {
            console.log('FAILURE: Unexpected response');
        }
    })
    .catch(err => {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    });
