import httpStatus from 'http-status';
import response from '../utils/response';
import AuthService from '../services/AuthService';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';
import Helper from '../utils/helpers/Helper';

// import Addem from '../services/Add';

const log = debug('app:admin-controller');

/**
 * @class
 * @description
 * @exports AdminController
 */
export default class AdminController {
    /**
     * @method onboardAdmin
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Admin
     */
    static onboardAdmin(req, res) {
        const { admin, token } = req;
        return response(res, httpStatus.CREATED, 'Admin onboarded successfully', { token, admin });
    }

    /**
     * @method adminLogin
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Admin
     */
    static adminLogin(req, res) {
        const { admin, token } = req;
        return response(res, httpStatus.OK, 'Login successful', { token, admin });
    }

    /**
     * @method getUsers
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Admin
     */
    static getUsers(req, res) {
        const { users, isDriver } = req;
        return response(res, httpStatus.OK, `${isDriver ? 'Drivers' : 'Riders'} retrieved successfully`, isDriver ? { drivers: users } : { riders: users });
    }

    /**
     * @method getUser
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Admin
     */
    static getUser(req, res) {
        const { userDB, isDriver } = req;
        return response(res, httpStatus.OK, `${isDriver ? 'Driver' : 'Rider'} retrieved successfully`, isDriver ? { driver: userDB } : { rider: userDB });
    }

    /**
     * @method deleteUser
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Admin
     */
    static deleteUser(req, res) {
        return response(res, httpStatus.OK, 'User deleted successfully');
    }

    /**
     * @method addUser
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Admin
     */
    static async addUser(req, res, next) {
        const { newUser, isDriver } = req;
        const {
            id,
            email,
            firstName,
            lastName,
            avatar,
            isEmailVerified,
            onboardingStatus,
            referenceId
        } = newUser;
        const user = {
            id,
            email,
            firstName,
            lastName,
            avatar,
            reference: referenceId,
            isEmailVerified,
            onboardingStatus
        };
        try {
            const token = await AuthService.createRegToken(id, 'email');
            const userToken = await Helper.generateToken({ id, role: isDriver ? 'driver' : 'rider' });
            user.token = userToken;
            Helper.sendEmailLink(firstName, email, token.token, req.headers.host, 'email')
                .catch(err => log(err));
            return response(res, httpStatus.CREATED,
                `${isDriver ? 'Driver' : 'Rider'} created successfully`,
                isDriver ? { driver: user } : { rider: user });
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method getMakes
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Admin
     */
    static getMakes(req, res) {
        const { makes } = req;
        return response(res, httpStatus.OK, 'makes retrieved successfully', makes);
    }

    /**
     * @method getModels
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Admin
     */
    static getModels(req, res) {
        const { makeModels } = req;
        return response(res, httpStatus.OK, 'models retrieved successfully', { models: makeModels });
    }

    // /**
    //  * @method AddCars
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof Admin
    //  */
    // static async addCars(req, res, next) {
    //     try {
    //         await Addem.addModels();
    //         return res.send('Added');
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }
}
