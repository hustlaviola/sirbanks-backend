import httpStatus from 'http-status';

import Helper from '../utils/helpers/Helper';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
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
            const { role } = req.params;
            if (!token) {
                return next(new APIError(
                    messages.noVerificationToken, httpStatus.NOT_FOUND, true
                ));
            }
            const user = await UserService.findById(token.userId, role);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            if (req.url.includes('verification') && user.isEmailVerified) {
                return next(new APIError(
                    messages.alreadyVerified, httpStatus.CONFLICT, true
                ));
            }
            req.user = user;
            req.token = token;
            return next();
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateLogin
     * @description Validates Login with email and password
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Auth
     */
    static async validateLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const { role } = req.params;
            const user = await UserService.findByEmailnRole(email, role);
            if (!user) {
                return next(new APIError(
                    messages.invalidCred, httpStatus.UNAUTHORIZED, true
                ));
            }
            const match = await Helper.comparePassword(password, user.password);
            if (!match) {
                return next(new APIError(
                    messages.invalidCred, httpStatus.UNAUTHORIZED, true
                ));
            }
            if (!user.isEmailVerified) {
                return next(new APIError(
                    messages.notVerified, httpStatus.UNAUTHORIZED, true
                ));
            }
            req.user = user;
            return next();
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateEmailVerification
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Auth
     */
    static async validateEmailVerification(req, res, next) {
        try {
            const { role } = req.params;
            const user = await UserService.findByEmailnRole(req.body.email, role);
            if (!user) {
                return next(new APIError(
                    messages.noUserEmail, httpStatus.NOT_FOUND, true
                ));
            }
            if (req.url.includes('resend') && user.isEmailVerified) {
                return next(new APIError(
                    messages.alreadyVerified, httpStatus.CONFLICT, true
                ));
            }
            req.user = user;
            req.role = role;
            return next();
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
