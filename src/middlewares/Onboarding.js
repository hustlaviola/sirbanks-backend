import httpStatus from 'http-status';
import APIError from '../utils/errorHandler/ApiError';
import messages from '../utils/messages';
import Helper from '../utils/helpers/Helper';
import UserService from '../services/UserService';
import { debug } from '../config/logger';

const log = debug('app:onboarding-middleware');

/**
 * @class
 * @description
 * @exports Onboarding
 */
export default class Onboarding {
    /**
     * @method validateOnboarding
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static async validateOnboarding(req, res, next) {
        const {
            userReference, firstName, lastName, email
        } = req.body;
        try {
            const isValidRef = Helper.isValidKey(userReference, 'RF-');
            if (!isValidRef) {
                return next(new APIError(
                    messages.invalidUserRef, httpStatus.BAD_REQUEST, true
                ));
            }
            const isEmailTaken = await UserService.findByEmail(email);
            if (isEmailTaken) {
                return next(new APIError(messages.emailInUse, httpStatus.CONFLICT, true));
            }
            const password = await Helper.encryptPassword(req.body.password);
            const user = await UserService.findUserByReference(userReference);
            if (!user) {
                return next(new APIError(messages.userNotFound, httpStatus.NOT_FOUND, true));
            }
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.password = password;
            user.onboardingStatus = user.role === 'rider' ? 'completed' : 'personal_details';
            user.avatar = 'https://res.cloudinary.com/viola/image/upload/v1575029224/wb9azacz6mblteapgtr9.png';
            req.user = user;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateResendEmailLink
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static async validateResendEmailLink(req, res, next) {
        try {
            const user = await UserService.findByEmail(req.body.email);
            if (!user) {
                return next(new APIError(
                    messages.noUserEmail, httpStatus.NOT_FOUND, true
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
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
