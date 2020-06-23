import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import moment from 'moment';
import validator from 'validator';

import messages from '../messages';
import sendMail from '../sendMail';

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
        return bcrypt.hash(password, 12);
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
     * @param {object} name
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async checkImage(files, name) {
        if (!files || !Object.prototype.hasOwnProperty.call(files, name)) return false;
        return true;
    }

    /**
     * @method isValidDate
     * @description Check if date is valid
     * @static
     * @param {object} date
     * @returns {boolean} Boolean response
     * @memberof Helper
     */
    static async isValidDate(date) {
        const theDate = new Date(date);
        if (!moment(theDate).isValid()) return false;
        return true;
    }

    /**
     * @method isValidKey
     * @description Check if key is valid
     * @static
     * @param {object} key
     * @param {object} keyType
     * @returns {boolean} Boolean response
     * @memberof Helper
     */
    static isValidKey(key, keyType) {
        const type = key.substr(0, 3);
        if (type !== keyType) return false;
        const keyId = key.substr(3);
        if (!validator.isUUID(keyId)) return false;
        return true;
    }

    /**
     * @method sendEmailLink
     * @description Check if key is valid
     * @static
     * @param {object} name
     * @param {object} email
     * @param {object} token
     * @param {object} host
     * @param {object} linkType
     * @returns {boolean} Boolean response
     * @memberof Helper
     */
    static sendEmailLink(name, email, token, host, linkType) {
        const linkInline = linkType === 'email' ? 'email_verification' : 'password_reset';
        const instructionInline = linkType === 'email' ? 'verify your email address' : 'reset your password';
        const text = linkType === 'email' ? 'Verify' : 'Reset';
        const subject = linkType === 'email' ? 'Email Verification' : 'Reset Password';
        const message = linkType === 'email' ? messages.emailIntro : messages.passwordIntro;
        const link = `http://${host}/auth/${linkInline}/${token}`;
        const action = {
            instructions: `Please click the button below to ${instructionInline}`,
            text,
            link
        };
        return sendMail(name, email, subject, message, action);
    }

    /**
     * @method formatTrips
     * @description
     * @static
     * @param {object} trips - data object
     * @param {object} id
     * @returns {object} JSON response
     * @memberof Helper
     */
    static formatTrips(trips, id) {
        const tripsDTO = trips.map(trip => ({
            id: trip.id,
            riderId: id.toString() === trip.riderId.toString() ? undefined : trip.riderId,
            driverId: id.toString() === trip.driverId.toString() ? undefined : trip.driverId,
            pickUp: trip.pickUp,
            dropOff: trip.dropOff,
            status: trip.status,
            fare: trip.fare,
            date: trip.createdAt
        }));
        return tripsDTO;
    }
}
