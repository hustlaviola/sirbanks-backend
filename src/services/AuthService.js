import crypto from 'crypto';
import twilio from 'twilio';

import Token from '../models/Token';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @class
 * @description A service class for authentication
 * @exports AuthService
 */
export default class AuthService {
    /**
     * @method regToken
     * @description Generates a token for email service
     * @static
     * @param {object} userId - id of the user
     * @returns {object} JSON response
     * @memberof AuthService
     */
    static regToken(userId) {
        // Create a email verification token
        const token = { userId, token: crypto.randomBytes(16).toString('hex') };
        return Token.create(token);
    }

    /**
     * @method checkToken
     * @description Check if token exists in the database
     * @static
     * @param {object} token - token
     * @returns {object} JSON response
     * @memberof AuthService
     */
    static async checkToken(token) {
        const dbToken = await Token.findOne({ token });
        if (!dbToken) return false;
        return dbToken;
    }

    /**
     * @method checkOtp
     * @description Check if token exists in the database
     * @static
     * @param {object} userId
     * @param {object} token - token
     * @returns {object} JSON response
     * @memberof AuthService
     */
    static async checkOtp(userId, token) {
        const dbToken = await Token.findOne({ userId, token });
        if (!dbToken) return false;
        return dbToken;
    }

    /**
     * @method sendPhoneCode
     * @description
     * @static
     * @param {object} req
     * @returns {object} JSON response
     * @memberof AuthService
     */
    static async sendPhoneCode(req) {
        const result = await client
            .verify
            .services(process.env.TWILIO_SERVICE_ID)
            .verifications
            .create({
                to: `+${req.query.phone}`,
                channel: 'sms'
            });
        return result;
    }

    /**
     * @method verifyPhone
     * @description
     * @static
     * @param {object} req
     * @returns {object} JSON response
     * @memberof AuthService
     */
    static async verifyPhone(req) {
        const result = await client
            .verify
            .services(process.env.TWILIO_SERVICE_ID)
            .verificationChecks
            .create({
                to: `+${req.query.phone}`,
                code: req.query.code
            });
        return result;
    }

    /**
     * @method generateEmailToken
     * @description Generates a token for email service
     * @static
     * @param {object} userId - id of the user
     * @returns {object} JSON response
     * @memberof AuthService
     */
    static async generateEmailToken(userId) {
        const token = { userId, token: Math.floor(Math.random() * 10000) };
        return Token.create(token);
    }
}
