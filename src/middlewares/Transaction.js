import httpStatus from 'http-status';

import TransactionService from '../services/TransactionService';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';
import Helper from '../utils/helpers/Helper';

const log = debug('app:onboarding-middleware');

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
            amount, email, name, type
        } = req.body;
        const reference = `TX-${Helper.generateUniqueString()}`;
        // const exists = await TransactionService.getTransactionByRef(reference);
        // log('eXIST', exists);
        // if (exists) {
        //     return next(new APIError('reference already exists', httpStatus.CONFLICT, true));
        // }
        const { id } = req.user;
        const transaction = {
            amount: amount / 100,
            user: id,
            reference,
            narration: `${type} for ${name}, email: ${email}`,
            type
        };
        try {
            await TransactionService.createTransaction(transaction);
            req.reference = reference;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
