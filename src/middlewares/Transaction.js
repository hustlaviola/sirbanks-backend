import httpStatus from 'http-status';
import request from 'request';

import paystack from '../config/paystack';
import TransactionService from '../services/TransactionService';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';

const log = debug('app:onboarding-middleware');

const { refund } = paystack(request);

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
    }

    /**
     * @method sendBack
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static async sendBack(req, res) {
        log('REFUNDING TAIWO');
        const form = { transaction: 'b35e8066-6ed5-43d4-abf3-0040e86342df', amount: 9500 };
        refund(form, (err, body) => {
            if (err) {
                log(err);
                // TODO
            } else {
                log('TAIWO REFUNDED');
                log(body);
            }
        });
        res.status(200).send('TAIWO REFUNDED');
    }
}
