import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';

import Helper from '../utils/helpers/Helper';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import AuthService from '../services/AuthService';
import UserService from '../services/UserService';
import { debug } from '../config/logger';

const log = debug('app:auth-middleware');

/**
 * @class
 * @description Authentication middleware class
 * @exports Auth
 */
export default class Auth {
    /**
     * @method userAuth
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Auth
     */
    static userAuth(req, res, next) {
        if (!req.headers.authorization) {
            return next(new APIError(
                messages.notLoggedIn, httpStatus.UNAUTHORIZED, true
            ));
        }

        const token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            log(error);
            const message = Auth.getTokenErrorMessage(error);
            return next(new APIError(message, httpStatus.UNAUTHORIZED, true));
        }
    }

    /**
     * @method getTokenErrorMessage
     * @description get jwt error message
     * @static
     * @param {object} error - Request object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Auth
     */
    static getTokenErrorMessage(error) {
        const expMessage = 'your session has expired, please login again';
        const errorMessage = error.message === 'jwt expired' ? expMessage : 'Authentication failed';
        return errorMessage;
    }

    // /**
    //  * @method validateEmailOtpVerification
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof Auth
    //  */
    // static async validateEmailOtpVerification(req, res, next) {
    //     try {
    //         const { id } = req.user;
    //         const isValid = await AuthService.checkOtp(id, req.body.otp);
    //         if (!isValid) {
    //             return next(new APIError(
    //                 messages.invalidOtp, httpStatus.UNAUTHORIZED, true
    //             ));
    //         }
    //         const user = await UserService.findByIdAndRole(id, 'driver');
    //         if (!user) {
    //             return next(new APIError(
    //                 messages.userNotFound, httpStatus.NOT_FOUND, true
    //             ));
    //         }
    //         req.user = user;
    //         return next();
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }

    // /**
    //  * @method validateParamToken
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof Auth
    //  */
    // static async validateParamToken(req, res, next) {
    //     try {
    //         const token = await AuthService.checkToken(req.params.token);
    //         const { role } = req.params;
    //         if (!token) {
    //             return next(new APIError(
    //                 messages.noVerificationToken, httpStatus.NOT_FOUND, true
    //             ));
    //         }
    //         const user = await UserService.findByIdAndRole(token.userId, role);
    //         if (!user) {
    //             return next(new APIError(
    //                 messages.userNotFound, httpStatus.NOT_FOUND, true
    //             ));
    //         }
    //         if (req.url.includes('verification') && user.isEmailVerified) {
    //             return next(new APIError(
    //                 messages.alreadyVerified, httpStatus.CONFLICT, true
    //             ));
    //         }
    //         req.user = user;
    //         req.token = token;
    //         return next();
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }

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
            const loginMode = req.url.includes('email_login') ? 'email' : 'phone';
            const { email, password, phone } = req.body;
            const { role } = req.params;
            let user;
            if (loginMode === 'email') {
                user = await UserService.findByEmailAndRole(email, role);
                if (!user) {
                    return next(new APIError(
                        messages.invalidCred, httpStatus.UNAUTHORIZED, true
                    ));
                }
            } else {
                user = await UserService.findByPhoneAndRole(phone, role);
                if (!user) {
                    return next(new APIError(
                        messages.invalidCred, httpStatus.UNAUTHORIZED, true
                    ));
                }
            }
            const match = await Helper.comparePassword(password, user.password);
            if (!match) {
                return next(new APIError(
                    messages.invalidCred, httpStatus.UNAUTHORIZED, true
                ));
            }
            if (loginMode === 'email' && !user.isEmailVerified) {
                return next(new APIError(
                    messages.notVerified, httpStatus.UNAUTHORIZED, true
                ));
            }
            user.lastLoggedInAt = new Date();
            req.user = user;
            req.role = role;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateEmailLink
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Auth
     */
    static async validateEmailLink(req, res, next) {
        const linkType = req.url.includes('resend_email_verification') ? 'email' : 'password';
        try {
            const user = await UserService.findByEmail(req.body.email);
            if (!user) {
                return next(new APIError(
                    messages.noUserEmail, httpStatus.NOT_FOUND, true
                ));
            }
            if (linkType === 'email' && user.isEmailVerified) {
                return next(new APIError(
                    messages.alreadyVerified, httpStatus.CONFLICT, true
                ));
            }
            req.user = user;
            req.linkType = linkType;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateToken
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Auth
     */
    static async validateToken(req, res, next) {
        const linkType = req.url.includes('email_verification') ? 'email' : 'password';
        try {
            const token = await AuthService.findByToken(req.params.token, linkType);
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
            if (linkType === 'email' && user.isEmailVerified) {
                return next(new APIError(
                    messages.alreadyVerified, httpStatus.CONFLICT, true
                ));
            }
            req.user = user;
            req.token = token;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
