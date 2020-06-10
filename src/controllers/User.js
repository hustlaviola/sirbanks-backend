import httpStatus from 'http-status';

import response from '../utils/response';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import Helper from '../utils/helpers/Helper';
import { debug } from '../config/logger';

const log = debug('app:user-controller');

/**
 * @class
 * @description A controller class for Users
 * @exports UserController
 */
export default class UserController {
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
            const token = await Helper.generateToken({ id: user.id, role: 'driver' });
            const payload = {
                token,
                onboardingStatus: 'vehicle_details',
                isEmailVerified: user.isEmailVerified
            };
            return response(res, httpStatus.OK, messages.vehicleDetails, payload);
        } catch (error) {
            log(error);
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
            const token = await Helper.generateToken({ id: user.id, role: 'driver' });
            const payload = {
                token,
                onboardingStatus: user.onboardingStatus,
                isEmailVerified: user.isEmailVerified
            };
            return response(res, httpStatus.OK, messages.onboardingCompleted, payload);
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
