import httpStatus from 'http-status';

import response from '../utils/response';

/**
 * @class
 * @description
 * @exports Payment
 */export default class Payment {
    /**
     * @method getCards
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Payment
     */
    static getCards(req, res) {
        return response(res, httpStatus.OK, 'Cards retrieved successfully', { cards: req.cards });
    }

    /**
     * @method setDefaultCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Payment
     */
    static setDefaultCard(req, res) {
        return response(res, httpStatus.OK, 'Card set as default successfully');
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
}
