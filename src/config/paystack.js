const paystack = request => {
    const MySecretKey = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
    // sk_test_xxxx to be replaced by your own secret key
    const initialize = (form, mycallback) => {
        const options = {
            url: 'https://api.paystack.co/transaction/initialize',
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            form
        };
        const callback = (error, response, body) => mycallback(error, body);

        request.post(options, callback);
    };

    const verify = (ref, mycallback) => {
        const options = {
            url: `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            }
        };

        const callback = (error, response, body) => mycallback(error, body);

        request(options, callback);
    };

    const refund = (form, mycallback) => {
        const options = {
            url: 'api.paystack.co/refund',
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            form
        };
        const callback = (error, response, body) => mycallback(error, body);

        request.post(options, callback);
    };

    return { initialize, verify, refund };
};

export default paystack;
