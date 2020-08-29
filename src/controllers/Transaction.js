import httpStatus from 'http-status';

import response from '../utils/response';

/**
 * @class
 * @description
 * @exports Transaction
 */export default class Transaction {
    /**
     * @method createTransaction
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static createTransaction(req, res) {
        return response(res, httpStatus.OK, 'Transaction created successfully', { reference: req.reference });
    }
}
