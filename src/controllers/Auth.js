import httpStatus from 'http-status';

import Helper from '../utils/helpers/Helper';
import response from '../utils/response';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import AuthService from '../services/AuthService';
import { debug } from '../config/logger';

const log = debug('app:auth-controller');

/**
 * @class
 * @description A controller class for Authentication routes
 * @exports AuthController
 */
export default class AuthController {
    /**
     * @method login
     * @description Logs a user in
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async login(req, res, next) {
        try {
            const { user, role } = req;
            const {
                id, email, firstName, lastName, isEmailVerified, onboardingStatus, phone, avatar
            } = user;
            const payload = { id, role };
            const token = await Helper.generateToken(payload);
            const userDTO = {
                id,
                email,
                phone,
                firstName,
                lastName,
                avatar,
                isEmailVerified,
                onboardingStatus
            };
            await user.save();
            return response(res, httpStatus.OK, messages.loginSuccess, { token, user: userDTO });
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method sendEmailLink
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async sendEmailLink(req, res, next) {
        const { user, linkType } = req;
        try {
            const {
                id, firstName, email
            } = user;
            const message = linkType === 'email' ? messages.emailVerification : messages.passwordReset;
            const token = await AuthService.createRegToken(id, linkType);
            Helper.sendEmailLink(firstName, email, token.token, req.headers.host, linkType);
            return response(res, httpStatus.OK, message);
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method verifyEmail
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async verifyEmail(req, res, next) {
        try {
            const { user, token } = req;
            user.isEmailVerified = true;
            await token.remove();
            await user.save();
            return res.render('verify');
            // return response(res, httpStatus.OK, messages.emailVerified);
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method renderResetPage
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async renderResetPage(req, res, next) {
        try {
            const { user } = req;
            return res.render('reset', { email: user.email });
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method resetPassword
     * @description Reset password on request
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async resetPassword(req, res, next) {
        try {
            const { user, token } = req;
            const { password } = req.body;
            user.password = await Helper.encryptPassword(password);
            await token.remove();
            await user.save();
            return response(res, httpStatus.OK, messages.passwordUpdateSuccess);
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
