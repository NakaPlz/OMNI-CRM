const crypto = require('crypto');

const verifySignature = (req, res, next) => {
    try {
        const appSecret = process.env.META_APP_SECRET;
        const signature = req.headers['x-hub-signature-256'];

        if (!appSecret) {
            console.warn('META_APP_SECRET not set, skipping signature verification.');
            return next();
        }

        if (!signature) {
            console.warn('No signature found in request');
            return res.status(401).json({ error: 'No signature found' });
        }

        if (!req.rawBody) {
            console.error('Raw body not available for signature verification');
            return res.status(500).json({ error: 'Internal server error' });
        }

        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', appSecret)
            .update(req.rawBody)
            .digest('hex');

        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            next();
        } else {
            console.error('Invalid webhook signature');
            res.status(401).json({ error: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying signature:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = verifySignature;
