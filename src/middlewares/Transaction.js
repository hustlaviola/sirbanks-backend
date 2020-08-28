import httpStatus from 'http-status';

import TransactionService from '../services/TransactionService';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';

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
}
