import Rider from '../models/Rider';
import Driver from '../models/Driver';

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
     * @param {string} email - Email being queried
     * @param {string} role
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async findByEmail(email) {
        const exist = await Rider.findOne({ email });
        if (exist) return exist;
        return Driver.findOne({ email });
    }

    /**
     * @method findByPhone
     * @description Check if phone already exists
     * @static
     * @param {object} phone - Phone number being queried
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async findByPhone(phone) {
        const exist = await Rider.findOne({ phone });
        if (exist) return exist;
        return Driver.findOne({ phone });
    }

    /**
     * @method findByEmailnRole
     * @description Check user by email and role
     * @static
     * @param {string} email - Email being queried
     * @param {string} role
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async findByEmailnRole(email, role) {
        if (role === 'rider') {
            return Rider.findOne({ email });
        }
        return Driver.findOne({ email });
    }

    /**
     * @method createUser
     * @description Creates a new User
     * @static
     * @param {object} user - User object to be created
     * @param {string} isDriver - Rider or Driver
     * @returns {object} JSON response
     * @memberof UserService
     */
    static createUser(user, isDriver) {
        if (!isDriver) return Rider.create(user);
        return Driver.create(user);
    }

    /**
     * @method findById
     * @description Find a user by Id
     * @static
     * @param {string} id - User id
     * @param {string} role - Rider or Driver
     * @returns {object} JSON response
     * @memberof LionService
     */
    static findById(id, role) {
        if (role === 'rider') {
            return Rider.findById(id).select('-password');
        }
        return Driver.findById(id).select('-password');
    }
}
