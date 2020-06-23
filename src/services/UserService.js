import Rider from '../models/Rider';
import Driver from '../models/Driver';
import Trip from '../models/Trip';

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
     * @description Find user by email and role
     * @static
     * @param {string} email - Email being queried
     * @param {string} role
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async findByEmailAndRole(email, role) {
        if (role === 'rider') {
            return Rider.findOne({ email });
        }
        return Driver.findOne({ email });
    }

    /**
     * @method findByPhonenRole
     * @description Find user by phone and role
     * @static
     * @param {string} phone
     * @param {string} role
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async findByPhoneAndRole(phone, role) {
        if (role === 'rider') {
            return Rider.findOne({ phone });
        }
        return Driver.findOne({ phone });
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
     * @method findByIdAndRole
     * @description Find a user by Id
     * @static
     * @param {string} id - User id
     * @param {string} role - Rider or Driver
     * @returns {object} JSON response
     * @memberof UserService
     */
    static findByIdAndRole(id, role) {
        if (role === 'rider') {
            return Rider.findById(id).select('-password');
        }
        return Driver.findById(id).select('-password');
    }

    /**
     * @method findById
     * @description Find a user by Id
     * @static
     * @param {string} id - User id
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async findById(id) {
        const exist = await Rider.findById(id);
        if (exist) return exist;
        return Driver.findById(id);
    }

    /**
     * @method findUserByReference
     * @description
     * @static
     * @param {string} referenceId
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async findUserByReference(referenceId) {
        const rider = await Rider.findOne({ referenceId });
        if (rider) {
            rider.role = 'rider';
            return rider;
        }
        const driver = await Driver.findOne({ referenceId });
        if (driver) driver.role = 'driver';
        return driver;
    }

    /**
     * @method getUserTrips
     * @description
     * @static
     * @param {string} userId - User id
     * @param {string} role - Driver or Rider
     * @returns {object} JSON response
     * @memberof UserService
     */
    static async getUserTrips(userId, role) {
        const field = role === 'rider' ? { riderId: userId } : { driverId: userId };
        return Trip.find(field).select(
            ['id', 'riderId', 'driverId', 'pickUp', 'dropOff', 'status', 'fair']
        );
    }
}
