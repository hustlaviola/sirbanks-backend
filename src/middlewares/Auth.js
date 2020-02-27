import httpStatus from 'http-status';

import messages from '../utils/messages';
import APIError from '../utils/errorHandler/APIError';
import AuthService from '../services/AuthService';
import UserService from '../services/UserService';

/**
 * @class
 * @description Authentication middleware class
 * @exports Auth
 */
export default class Auth {
    /**
     * @method validateParamToken
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Auth
     */
    static async validateParamToken(req, res, next) {
        try {
            const token = await AuthService.checkToken(req.params.token);
            if (!token) {
                return next(new APIError(
                    messages.noVerificationToken, httpStatus.NOT_FOUND, true
                ));
            }
            const user = await UserService.findById(token.userId);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            if (user.isEmailVerified) {
                return next(new APIError(
                    messages.alreadyVerified, httpStatus.CONFLICT, true
                ));
            }
            req.user = user;
            return next();
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
