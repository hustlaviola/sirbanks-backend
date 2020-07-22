import httpStatus from 'http-status';
import response from '../utils/response';

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

    // /**
    //  * @method getTrips
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @returns {object} JSON response
    //  * @memberof Admin
    //  */
    // static getTrips(req, res) {
    //     const { trips } = req;
    //     return response(res, httpStatus.OK, 'Trips retrieved successfully', trips);
    // }
}
