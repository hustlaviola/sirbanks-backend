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
            const { dbUser, isAdmin } = req;
            let token;
            if (!isAdmin) token = await Helper.generateToken({ id: dbUser.id, role: 'driver' });
            const payload = {
                token,
                reference: isAdmin ? dbUser.referenceId : undefined,
                onboardingStatus: dbUser.onboardingStatus,
                isEmailVerified: dbUser.isEmailVerified
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
            const { dbUser, isAdmin } = req;
            let token;
            if (!isAdmin) token = await Helper.generateToken({ id: dbUser.id, role: 'driver' });
            const payload = {
                token,
                onboardingStatus: dbUser.onboardingStatus,
                isEmailVerified: dbUser.isEmailVerified
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
    static uploadAvatar(req, res) {
        const { user } = req;
        return response(res, httpStatus.OK, messages.avatarUploadSuccessful,
            { avatar: user.avatar });
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

    /**
     * @method updateUser
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof UserController
     */
    static updateUser(req, res) {
        const { role } = req;
        return response(res, httpStatus.OK, `${role} updated successfully`);
    }

    /**
     * @method getAvatar
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof UserController
     */
    static getAvatar(req, res) {
        const { avatar } = req;
        return response(res, httpStatus.OK, 'avatar retrieved successfully', { avatar });
    }
}
