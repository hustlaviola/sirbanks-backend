import Admin from '../models/Admin';
import Driver from '../models/Driver';
import Rider from '../models/Rider';

/**
 * @class
 * @description
 * @exports AdminService
 */
export default class AdminService {
    /**
     * @method findByEmail
     * @description
     * @static
     * @param {object} email
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async findByEmail(email) {
        return Admin.findOne({ email });
    }

    /**
     * @method findById
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async findById(id) {
        return Admin.findById(id);
    }

    /**
     * @method createAdmin
     * @description
     * @static
     * @param {object} admin
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async createAdmin(admin) {
        return Admin.create(admin);
    }

    /**
     * @method getUsers
     * @description
     * @static
     * @param {object} isDriver
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getUsers(isDriver) {
        let users;
        if (isDriver) users = await Driver.find({ onboardingStatus: { $in: ['completed', 'personal_details'] } });
        else users = await Rider.find({ onboardingStatus: 'completed' });
        const usersDTO = users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar
        }));
        return usersDTO;
    }
}
