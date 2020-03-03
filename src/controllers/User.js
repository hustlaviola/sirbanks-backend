import httpStatus from 'http-status';

import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import response from '../utils/response';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import sendMail from '../utils/sendMail';

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
            const { role } = req.params;
            user = await UserService.createUser(user, role);
            const { firstName, email } = user;

            const token = await AuthService.regToken(user.id);
            const link = `http://${req.headers.host}/api/v1/auth/email_verification/${role}/${token.token}`;
            const action = {
                instructions: 'Please click the button below to verify your email address',
                text: 'Verify',
                link
            };

            await sendMail(firstName, email, 'Email Confirmation', 'Email Verification', action);

            return response(res, httpStatus.CREATED, messages.registration);
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
