import fetch from 'node-fetch';

const paystack = () => {
    const MySecretKey = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;

    const initialize = data => {
        const url = 'https://api.paystack.co/transaction/initialize';
        const options = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                authorization: MySecretKey,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        };
        return fetch(url, options);
    };

    const verify = ref => {
        const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`;
        const options = {
            method: 'get',
            headers: {
                authorization: MySecretKey,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        };
        return fetch(url, options);
    };

    const refund = data => {
        const url = 'https://api.paystack.co/refund';
        const options = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                authorization: MySecretKey,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        };
        return fetch(url, options);
    };

    const chargeAuth = data => {
        const url = 'https://api.paystack.co/transaction/charge_authorization';
        const options = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                authorization: MySecretKey,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        };
        return fetch(url, options);
    };

    return {
        initialize, verify, refund, chargeAuth
    };
};

export default paystack;
