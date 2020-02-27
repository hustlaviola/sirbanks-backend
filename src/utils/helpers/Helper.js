import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @class Helper
 * @description An helper class for authentication
 * @exports Helper
 */
export default class Helper {
    /**
     * @method generateToken
     * @description Generates token for securing endpoints
     * @static
     * @param {object} data - data object
     * @returns {object} JSON response
     * @memberof Helper
     */
    static generateToken(data) {
        return jwt.sign(data, process.env.SECRET, { expiresIn: '365d' });
    }

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

    /**
     * @method comparePassword
     * @description compare given password with db password
     * @static
     * @param {object} password - Given password
     * @param {object} hashPassword - Db password
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async comparePassword(password, hashPassword) {
        return bcrypt.compare(password, hashPassword);
    }
}
