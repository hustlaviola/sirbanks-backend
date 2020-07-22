import httpStatus from 'http-status';
import { v4 as uuid } from 'uuid';
import APIError from '../utils/errorHandler/ApiError';
import messages from '../utils/messages';
import Helper from '../utils/helpers/Helper';
import { debug } from '../config/logger';
import AdminService from '../services/AdminService';

const log = debug('app:admin-middleware');

/**
 * @class
 * @description
 * @exports Admin
 */
export default class Admin {
    /**
     * @method validateAdminOnboarding
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Admin
     */
    static async validateAdminOnboarding(req, res, next) {
        const {
            email, firstName, lastName, phone
        } = req.body;
        if (req.user.permissions < 3) {
            return next(new APIError(messages.unauthorized, httpStatus.UNAUTHORIZED, true));
        }
        try {
            const manager = await AdminService.findById(req.user.id);
            if (!manager) {
                return next(new APIError('Manager not found', httpStatus.NOT_FOUND, true));
            }
            const adminExists = await AdminService.findByEmail(email);
            if (adminExists) {
                return next(new APIError('email is already in use', httpStatus.CONFLICT, true));
            }
            const password = await Helper.encryptPassword(req.body.password);
            const publicId = `PB-${uuid()}`;
            const avatar = 'https://res.cloudinary.com/viola/image/upload/v1575029224/wb9azacz6mblteapgtr9.png';
            let admin = {
                firstName, lastName, email, password, phone, publicId, avatar
            };
            admin = await AdminService.createAdmin(admin);
            const { id, permissions } = admin;
            const token = await Helper.generateToken({ id, permissions });
            req.admin = {
                id,
                firstName,
                lastName,
                avatar,
                email
            };
            req.token = token;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateAdminLogin
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Admin
     */
    static async validateAdminLogin(req, res, next) {
        const { email, password } = req.body;
        try {
            const admin = await AdminService.findByEmail(email);
            if (!admin) {
                return next(new APIError(messages.invalidCred, httpStatus.BAD_REQUEST, true));
            }
            const match = await Helper.comparePassword(password, admin.password);
            if (!match) {
                return next(new APIError(
                    messages.invalidCred, httpStatus.BAD_REQUEST, true
                ));
            }
            const { id, permissions } = admin;
            const token = await Helper.generateToken({ id, permissions });
            req.admin = {
                id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                avatar: admin.avatar,
                email,
                lastLoggedInAt: admin.lastLoggedInAt
            };
            req.token = token;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateGetUsers
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Admin
     */
    static async validateGetUsers(req, res, next) {
        if (!req.user.permissions) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            let isDriver = false;
            if (req.url.includes('drivers')) isDriver = true;
            const users = await AdminService.getUsers(isDriver);
            req.users = users;
            req.isDriver = isDriver;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateGetUser
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Admin
     */
    static async validateGetUser(req, res, next) {
        const { userId } = req.params;
        if (!req.user.permissions) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            let isDriver = false;
            if (req.url.includes('drivers')) isDriver = true;
            const user = await AdminService.getUser(userId, isDriver);
            if (!user) {
                return next(new APIError(`${isDriver ? 'Driver' : 'Rider'} not found`, httpStatus.NOT_FOUND, true));
            }
            req.userDB = user;
            req.isDriver = isDriver;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    // /**
    //  * @method validateGetTrips
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof Admin
    //  */
    // static async validateGetTrips(req, res, next) {
    //     const { userId } = req.params;
    //     if (!req.user.permissions) {
    //         return next(new APIError(
    //             messages.unauthorized, httpStatus.UNAUTHORIZED, true
    //         ));
    //     }
    //     try {
    //         let isDriver = false;
    //         if (req.url.includes('drivers')) isDriver = true;
    //         const trips = await AdminService.getTrips(userId, isDriver);
    //         req.trips = trips;
    //         return next();
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }

    // /**
    //  * @method validateGetTrip
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof Admin
    //  */
    // static async validateGetTrip(req, res, next) {
    //     const { userId } = req.params;
    //     if (!req.user.permissions) {
    //         return next(new APIError(
    //             messages.unauthorized, httpStatus.UNAUTHORIZED, true
    //         ));
    //     }
    //     try {
    //         let isDriver = false;
    //         if (req.url.includes('drivers')) isDriver = true;
    //         const trips = await AdminService.getTrips(userId, isDriver);
    //         req.trips = trips;
    //         return next();
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }
}
