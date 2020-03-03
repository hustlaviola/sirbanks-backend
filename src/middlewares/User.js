import httpStatus from 'http-status';

import UserService from '../services/UserService';
import Helper from '../utils/helpers/Helper';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';

/**
 * @class
 * @description User middleware class
 * @exports UserValidator
 */
export default class UserValidator {
    /**
     * @method validateUserReg
     * @description Validates User registration credentials
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserValidator
     */
    static async validateUserReg(req, res, next) {
        const {
            firstName,
            lastName,
            email,
            phone
        } = req.body;
        const { role } = req.query;
        try {
            const isEmail = await UserService.findByEmail(email);
            if (isEmail) {
                return next(new APIError(
                    messages.emailInUse, httpStatus.CONFLICT, true
                ));
            }
            const isPhone = await UserService.findByPhone(phone);
            if (isPhone) {
                return next(new APIError(
                    messages.phoneInUse, httpStatus.CONFLICT, true
                ));
            }
            let { password } = req.body;
            password = await Helper.encryptPassword(password);
            const user = {
                firstName,
                lastName,
                email,
                phone,
                role,
                password,
                avatar: 'https://res.cloudinary.com/viola/image/upload/v1575029224/wb9azacz6mblteapgtr9.png'
            };
            req.user = user;
            return next();
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
