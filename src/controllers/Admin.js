import httpStatus from 'http-status';
import response from '../utils/response';

/**
 * @class
 * @description
 * @exports AdminController
 */
export default class AdminController {
    /**
     * @method onboardAdmin
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static onboardAdmin(req, res) {
        const { admin, token } = req;
        return response(res, httpStatus.CREATED, 'Admin onboarded successfully', { token, data: admin });
    }

    /**
     * @method adminLogin
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static adminLogin(req, res) {
        const { admin, token } = req;
        return response(res, httpStatus.OK, 'Login successful', { token, data: admin });
    }
}
