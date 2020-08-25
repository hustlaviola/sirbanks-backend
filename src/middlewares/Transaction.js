import httpStatus from 'http-status';
// import request from 'request';
import crypto from 'crypto';

// import paystack from '../config/paystack';
import TransactionService from '../services/TransactionService';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';

const log = debug('app:onboarding-middleware');

// const { initializePayment, verifyPayment } = paystack(request);

/**
 * @class
 * @description
 * @exports Transaction
 */
export default class Transaction {
    /**
     * @method createTransaction
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static async createTransaction(req, res, next) {
        const {
            amount, email, name, reference, type
        } = req.body;
        const exists = await TransactionService.getTransactionByRef(reference);
        log('eXIST', exists);
        if (exists) {
            return next(new APIError('reference already exists', httpStatus.CONFLICT, true));
        }
        const { id } = req.user;
        const transaction = {
            amount,
            user: id,
            reference,
            narration: `${type} for ${name}, email: ${email}`,
            type
        };
        try {
            await TransactionService.createTransaction(transaction);
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
        // const form = {
        //     amount: amount * 100,
        //     email,
        //     full_name: name
        // };
        // form.metadata = {
        //     full_name: form.full_name
        // };
        // initializePayment(form, (err, body) => {
        //     if (err) {
        //         log(err);
        //         return next(new APIError(
        //             'Error while initializing payment', httpStatus.BAD_REQUEST, true
        //         ));
        //     }
        //     log(body);
        //     const response = JSON.parse(body);
        //     res.send(response);
        // });
    }

    /**
     * @method confirmPayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static async confirmPayment(req, res) {
        log('IP ADDRESS: ', req.ip);
        log(JSON.stringify(req.body));
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
        log('HASH', hash);
        log('x-paystack-signature', req.headers['x-paystack-signature']);
        if (hash === req.headers['x-paystack-signature']) {
            log(req.body.data);
            log(req.body.data.custommer);
            log(JSON.stringify(req.body));
        }
        res.send(200);
    }
}
