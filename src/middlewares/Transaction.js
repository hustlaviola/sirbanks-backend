import httpStatus from 'http-status';

import TransactionService from '../services/TransactionService';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';
import Helper from '../utils/helpers/Helper';
import UserService from '../services/UserService';
import messages from '../utils/messages';

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
            amount, type
        } = req.body;
        const reference = `TX-${Helper.generateUniqueString()}`;
        const { id, role } = req.user;
        try {
            const user = await UserService.findByIdAndRole(id, role);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            const transaction = {
                amount,
                user: id,
                reference,
                narration: `${type} for ${user.firstName}, email: ${user.email}`,
                type
            };
            await TransactionService.createTransaction(transaction);
            req.reference = reference;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
