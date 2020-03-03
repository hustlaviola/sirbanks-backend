import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';

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

    /**
     * @method checkImageType
     * @description Check if image is valid
     * @static
     * @param {object} image
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async checkImageType(image) {
        const extensions = ['.png', '.jpeg', '.jpg'];
        const ext = path.extname(image.name).toLowerCase();
        return extensions.includes(ext);
    }

    /**
     * @method checkImage
     * @description Check if image is valid
     * @static
     * @param {object} files - Request files
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async checkImage(files) {
        if (!files || !Object.prototype.hasOwnProperty.call(files, 'avatar')) return false;
        return true;
    }
}
