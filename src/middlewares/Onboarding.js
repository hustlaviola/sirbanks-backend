import httpStatus from 'http-status';
import APIError from '../utils/errorHandler/ApiError';
import messages from '../utils/messages';
import Helper from '../utils/helpers/Helper';
import UserService from '../services/UserService';
import OnboardingService from '../services/OnboardingService';
import { debug } from '../config/logger';
import promiseHandler from '../utils/promiseHandler';

const log = debug('app:onboarding-middleware');

/**
 * @class
 * @description
 * @exports Onboarding
 */
export default class Onboarding {
    /**
     * @method initiateOnboarding
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static async initiateOnboarding(req, res, next) {
        const {
            firstName, lastName, phone, email, deviceToken, devicePlatform
        } = req.body;
        try {
            const phoneExists = await UserService.phoneExists(phone);
            if (phoneExists) {
                return next(new APIError(messages.phoneInUse, httpStatus.CONFLICT, true));
            }
            const emailExists = await UserService.emailExists(email);
            if (emailExists) {
                return next(new APIError(messages.emailInUse, httpStatus.CONFLICT, true));
            }
            const password = await Helper.encryptPassword(req.body.password);
            const user = {
                firstName,
                lastName,
                phone,
                email,
                password,
                role: req.query.role,
                deviceToken,
                devicePlatform
            };
            const [err, rsp] = await promiseHandler(OnboardingService.sendPhoneCode(phone));
            log(`sendPhoneCode ERR == ${err}`);
            log(`sendPhoneCode RSP == ${JSON.stringify(rsp)}`);
            if (err) return next(new APIError('Unable to validate phone', httpStatus.BAD_GATEWAY, true));
            await OnboardingService.addUser(user);
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method completeOnboarding
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Onboarding
     */
    static async completeOnboarding(req, res, next) {
        const { phone, otp } = req.body;
        try {
            const tempUser = await OnboardingService.findByPhone(phone);
            if (!tempUser) {
                return next(new APIError('OTP expired or not found', httpStatus.BAD_REQUEST, true));
            }
            const phoneExists = await UserService.phoneExists(phone);
            if (phoneExists) {
                return next(new APIError(messages.phoneInUse, httpStatus.CONFLICT, true));
            }
            const emailExists = await UserService.emailExists(tempUser.email);
            if (emailExists) {
                return next(new APIError(messages.emailInUse, httpStatus.CONFLICT, true));
            }
            const [err, rsp] = await promiseHandler(OnboardingService.verifyPhone(phone, otp));
            if (err) return next(new APIError('Unable to verify phone', httpStatus.BAD_GATEWAY, true));
            log(`verifyPhone ERR == ${err}`);
            log(`verifyPhone RSP == ${JSON.stringify(rsp)}`);
            const user = {
                firstName: tempUser.firstName,
                lastName: tempUser.lastName,
                phone,
                email: tempUser.email,
                password: tempUser.password,
                deviceToken: tempUser.deviceToken,
                devicePlatform: tempUser.devicePlatform
            };
            await OnboardingService.addVerifiedUser(user, tempUser.role);
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

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
            userReference, firstName, lastName, email, deviceToken, devicePlatform
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
            user.device = {
                platform: devicePlatform,
                token: deviceToken
            };
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
