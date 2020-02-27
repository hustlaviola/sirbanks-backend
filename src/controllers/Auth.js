import httpStatus from 'http-status';

import response from '../utils/response';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import AuthService from '../services/AuthService';

/**
 * @class
 * @description A controller class for Authentication routes
 * @exports AuthController
 */
export default class AuthController {
    /**
     * @method sendPhoneCode
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async sendPhoneCode(req, res, next) {
        try {
            const result = await AuthService.sendPhoneCode(req);
            return response(res, httpStatus.OK, messages.phoneCode, result);
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method verifyPhone
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async verifyPhone(req, res, next) {
        try {
            const result = await AuthService.verifyPhone(req);
            return response(res, httpStatus.OK, messages.phoneVerified, result);
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method verifyEmailOrRenderReset
     * @description Verifies email or render password reset page
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async verifyEmailOrRenderReset(req, res, next) {
        try {
            const { user } = req;
            user.isEmailVerified = true;
            await user.save();
            return response(res, httpStatus.OK, messages.emailVerified);
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
