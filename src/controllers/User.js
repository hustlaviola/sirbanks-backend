import httpStatus from 'http-status';

import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import response from '../utils/response';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import sendMail, { sendOtpMail } from '../utils/sendMail';
import Helper from '../utils/helpers/Helper';

/**
 * @class
 * @description A controller class for Users
 * @exports UserController
 */
export default class UserController {
    /**
     * @method register
     * @description Implements user registration endpoint
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserController
     */
    static async register(req, res, next) {
        try {
            let { user } = req;
            const { isDriver } = req;
            user = await UserService.createUser(user, isDriver);
            const { id, firstName, email } = user;
            let token;
            if (isDriver) {
                token = await AuthService.generateEmailToken(user.id);
                const instructions = `Your One Time Password is: ${token.token}`;
                await sendOtpMail(email, 'Email Confirmation', instructions);
                const userToken = await Helper.generateToken({ id });
                const { onboardingStatus, isEmailVerified } = user;
                return response(res, httpStatus.CREATED,
                    messages.driverAccount,
                    { token: userToken, onboardingStatus, isEmailVerified });
            }

            token = await AuthService.regToken(user.id);
            const link = `http://${req.headers.host}/api/v1/auth/email_verification/rider/${token.token}`;
            const action = {
                instructions: 'Please click the button below to verify your email address',
                text: 'Verify',
                link
            };
            await sendMail(firstName, email, 'Email Confirmation', 'Email Verification', action);

            return response(res, httpStatus.CREATED, messages.riderAccount);
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method updateVehicleDetails
     * @description Updates vehicle details
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserController
     */
    static async updateVehicleDetails(req, res, next) {
        try {
            const { user } = req;
            user.onboardingStatus = 'vehicle_details';
            await user.save();
            const token = await Helper.generateToken({ id: user.id });
            const payload = {
                token,
                onboardingStatus: 'vehicle_details',
                isEmailVerified: user.isEmailVerified
            };
            return response(res, httpStatus.OK, messages.vehicleDetails, payload);
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method upLoadDriverFiles
     * @description Upload files
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserController
     */
    static async upLoadDriverFiles(req, res, next) {
        try {
            const { user } = req;
            await user.save();
            const token = await Helper.generateToken({ id: user.id });
            const payload = {
                token,
                onboardingStatus: user.onboardingStatus,
                isEmailVerified: user.isEmailVerified
            };
            return response(res, httpStatus.OK, messages.onboardingCompleted, payload);
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
