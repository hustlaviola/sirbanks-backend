import bcrypt from 'bcryptjs';

/**
 * @class Helper
 * @description An helper class for authentication
 * @exports Helper
 */
export default class Helper {
    /**
     * @method encryptPassword
     * @description Encrypt password
     * @static
     * @param {object} password - Password being encrypted
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async encryptPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
}
