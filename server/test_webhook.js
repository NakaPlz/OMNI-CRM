const axios = require('axios');

const url = 'http://localhost:3000/api/webhooks';
const data = {
    object: 'whatsapp_business_account',
    entry: [{
        id: '123',
        changes: [{
            value: {
                messages: [{
                    from: '1234567890',
                    text: { body: 'Hello World' }
                }]
            }
        }]
    }]
};

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
    });
