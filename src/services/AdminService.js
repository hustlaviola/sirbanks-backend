import Admin from '../models/Admin';

/**
 * @class
 * @description
 * @exports AdminService
 */export default class AdminService {
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
}
