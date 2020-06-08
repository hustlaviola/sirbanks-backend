import httpStatus from 'http-status';

import Helper from '../utils/helpers/Helper';
import response from '../utils/response';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import AuthService from '../services/AuthService';
import sendMail, { sendOtpMail } from '../utils/sendMail';
import { debug } from '../config/logger';

const log = debug('app:auth-controller');

/**
 * @class
 * @description A controller class for Authentication routes
 * @exports AuthController
 */
export default class AuthController {
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
            if (req.url.includes('reset_password')) {
                return res.render('reset', { email: user.email });
            }
            user.isEmailVerified = true;
            await user.save();
            return response(res, httpStatus.OK, messages.emailVerified);
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method verifyEmail
     * @description Verifies email or render password reset page
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async verifyEmail(req, res, next) {
        try {
            let { user } = req;
            user.isEmailVerified = true;
            user.onboardingStatus = 'email_verified';
            const token = await Helper.generateToken({ id: user.id });
            user = await user.save();
            const payload = {
                token,
                onboardingStatus: user.onboardingStatus,
                isEmailVerified: user.isEmailVerified
            };
            return response(res, httpStatus.OK, messages.emailVerified, payload);
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

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
                id, firstName, lastName, isEmailVerified, onboardingStatus
            } = user;
            const payload = { id, role };
            const token = await Helper.generateToken(payload);
            const userDTO = {
                id,
                firstName,
                lastName,
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
     * @method emailVerificationOrResetPassword
     * @description Resend email verification link or send password reset link
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof AuthController
     */
    static async emailVerificationOrResetPassword(req, res, next) {
        try {
            const { user, role } = req;
            const { id, firstName, email } = user;
            let token;
            if (role === 'driver' && req.url.includes('resend')) {
                token = await AuthService.generateEmailToken(user.id);
                const instructions = `Your One Time Password is: ${token.token}`;
                await sendOtpMail(email, 'Email Verification', instructions);
                const { onboardingStatus } = user;
                return response(res, httpStatus.CREATED,
                    messages.registration, { onboardingStatus });
            }
            token = await AuthService.regToken(id);
            let type = 'email_verification';
            let subject = 'Email Confirmation';
            let intro = 'Email Verification';
            let text = 'Verify';
            let message = messages.emailVerification;

            if (req.url.includes('forgot_password')) {
                type = 'reset_password';
                subject = 'Password Reset';
                intro = 'Reset Password';
                text = 'Reset';
                message = messages.passwordReset;
            }
            const link = `http://${req.headers.host}/api/v1/auth/${type}/${role}/${token.token}`;
            const act = type === 'email_verification' ? 'verify your email address' : 'reset your password';
            const action = {
                instructions: `Please click the button below to ${act}`,
                text,
                link
            };
            await sendMail(firstName, email, subject, intro, action);
            return response(res, httpStatus.OK, message);
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
