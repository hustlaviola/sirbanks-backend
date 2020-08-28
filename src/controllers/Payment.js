import httpStatus from 'http-status';

import response from '../utils/response';

/**
 * @class
 * @description
 * @exports Payment
 */export default class Payment {
    /**
     * @method confirmPayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Payment
     */
    static confirmPayment(req, res) {
        return response(res, httpStatus.OK, 'Payment acknowledged');
    }
}
