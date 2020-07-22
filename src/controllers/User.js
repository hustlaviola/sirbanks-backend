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

    /**
     * @method getUserTrips
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserController
     */
    static getUserTrips(req, res) {
        const { trips } = req;
        return response(res, httpStatus.OK, messages.tripsRetrievalSuccess, trips);
    }

    /**
     * @method uploadAvatar
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserController
     */
    static async uploadAvatar(req, res, next) {
        try {
            const { user } = req;
            const { avatar } = await user.save();
            return response(res, httpStatus.OK, messages.avatarUploadSuccessful, { avatar });
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method getUsersCount
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof UserController
     */
    static getUsersCount(req, res) {
        const { totalUsers } = req;
        return response(res, httpStatus.OK, 'Total users count retrieved successfully', { totalUsers });
    }

    /**
     * @method getDriversCount
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof UserController
     */
    static getDriversCount(req, res) {
        const { totalDrivers } = req;
        return response(res, httpStatus.OK, 'Total drivers count retrieved successfully', { totalDrivers });
    }

    /**
     * @method getOnlineDrivers
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof UserController
     */
    static getOnlineDrivers(req, res) {
        const { onlineDrivers } = req;
        return response(res, httpStatus.OK, 'Online drivers count retrieved successfully', { onlineDrivers });
    }
}
