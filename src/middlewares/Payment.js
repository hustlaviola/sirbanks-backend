import httpStatus from 'http-status';
import request from 'request';
import crypto from 'crypto';

import paystack from '../config/paystack';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';

const log = debug('app:onboarding-middleware');

const { initializePayment, verifyPayment } = paystack(request);

/**
 * @class
 * @description
 * @exports Payment
 */
export default class Payment {
    /**
     * @method initiatePayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Trip
     */
    static async initiatePayment(req, res, next) {
        const { amount, email, name } = req.body;
        const form = {
            amount: amount * 100,
            email,
            full_name: name
        };
        form.metadata = {
            full_name: form.full_name
        };
        initializePayment(form, (err, body) => {
            if (err) {
                log(err);
                return next(new APIError(
                    'Error while initializing payment', httpStatus.BAD_REQUEST, true
                ));
            }
            log(body);
            const response = JSON.parse(body);
            res.send(response);
        });
    }

    /**
     * @method confirmPayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Trip
     */
    static async confirmPayment(req, res) {
        log('IP ADDRESS: ', req.ip);
        log(JSON.stringify(req.body));
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
        log('HASH', hash);
        if (hash === req.headers['x-paystack-signature']) {
            log(req.body.data);
            log(req.body.data.custommer);
            log(JSON.stringify(req.body));
        }
        res.send(200);
    }
}
