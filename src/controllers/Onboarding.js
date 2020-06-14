import httpStatus from 'http-status';

import OnboardingService from '../services/OnboardingService';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import response from '../utils/response';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import Helper from '../utils/helpers/Helper';
import { debug } from '../config/logger';

const log = debug('app:onboarding-controller');

/**
 * @class
 * @description
 * @exports Onboarding
 */export default class Onboarding {
    /**
     * @method phoneVerification
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static async phoneVerification(req, res, next) {
        const { phone } = req.body;
        try {
            const user = await UserService.findByPhone(phone);
            if (user) {
                if (user.onboardingStatus !== 'initiated') {
                    return next(new APIError(messages.phoneInUse, httpStatus.CONFLICT, true));
                }
                return response(res, httpStatus.OK, messages.onboardingInit, {
                    reference: user.referenceId,
                    onboardingStatus: user.onboardingStatus
                });
            }
            await OnboardingService.sendPhoneCode(phone);
            return response(res, httpStatus.OK, messages.phoneCode, {
                onboardingStatus: 'unset'
            });
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method phoneVerificationCheck
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static async phoneVerificationCheck(req, res, next) {
        const { phone, otp } = req.body;
        const { role } = req.params;
        try {
            const result = await OnboardingService.verifyPhone(phone, otp);
            if (result.status !== 'approved') {
                return next(new APIError(messages.provideValidOtp, httpStatus.BAD_REQUEST, true));
            }
            const user = await OnboardingService.createUser(phone, role);
            return response(res, httpStatus.OK, messages.phoneVerified, {
                reference: user.referenceId,
                onboardingStatus: user.onboardingStatus
            });
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method updatePersonalDetails
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static async updatePersonalDetails(req, res, next) {
        const { user } = req;
        try {
            const {
                id, firstName, email, onboardingStatus, isEmailVerified
            } = user;
            const token = await AuthService.createRegToken(id, 'email');
            Helper.sendEmailLink(firstName, email, token.token, req.headers.host, 'email');
            const userToken = await Helper.generateToken({ id, role: user.role });
            await user.save();
            return response(res, httpStatus.CREATED, messages.onboardingComplete, {
                onboardingStatus,
                token: userToken,
                isEmailVerified
            });
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
