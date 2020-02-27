import User from '../models/User';

/**
 * @class
 * @description A service class for Users
 * @exports UserService
 */
export default class UserService {
    /**
     * @method findByEmail
     * @description Check if email already exists
     * @static
     * @param {object} email - Email being queried
     * @returns {object} JSON response
     * @memberof UserService
     */
    static findByEmail(email) {
        return User.findOne({ email });
    }

    /**
     * @method findByPhone
     * @description Check if phone already exists
     * @static
     * @param {object} phone - Phone number being queried
     * @returns {object} JSON response
     * @memberof UserService
     */
    static findByPhone(phone) {
        return User.findOne({ phone });
    }

    /**
     * @method createUser
     * @description Creates a new User
     * @static
     * @param {object} user - User object to be created
     * @returns {object} JSON response
     * @memberof UserService
     */
    static createUser(user) {
        return User.create(user);
    }

    /**
     * @method findById
     * @description Find a user by Id
     * @static
     * @param {object} id - User id
     * @returns {object} JSON response
     * @memberof LionService
     */
    static findById(id) {
        return User.findById(id).select('-password');
    }
}
