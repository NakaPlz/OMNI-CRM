const axios = require('axios');

const url = 'http://localhost:3000/api/webhooks';
const params = {
    'hub.mode': 'subscribe',
    'hub.verify_token': 'risut_crm_token',
    'hub.challenge': '12345'
};

axios.get(url, { params })
    .then(res => {
        console.log('Status:', res.status);
        console.log('Data:', res.data);
        if (res.data == 12345) {
            console.log('SUCCESS: Verification passed');
        } else {
            console.log('FAILURE: Challenge mismatch');
        }
    })
    .catch(err => {
        console.error('Error:', err.message);
    });
