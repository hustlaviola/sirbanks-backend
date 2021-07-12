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

    /**
     * @method removeCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Payment
     */
    static removeCard(req, res) {
        return response(res, httpStatus.OK, 'Card removed successfully');
    }

    /**
     * @method initiateAddCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Payment
     */
    static initiateAddCard(req, res) {
        return response(res, httpStatus.OK, 'Add card initiation successful', req.paymentInfo);
    }

    /**
     * @method completePayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Payment
     */
    static completePayment(req, res) {
        return response(res, httpStatus.OK, 'Success');
    }
}
