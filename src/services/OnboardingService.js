import twilio from 'twilio';

import Onboarding from '../models/Onboarding';
import Rider from '../models/Rider';
import Driver from '../models/Driver';
import Helper from '../utils/helpers/Helper';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @class
 * @description
 * @exports OnboardingService
 */export default class OnboardingService {
    /**
     * @method sendPhoneCode
     * @description
     * @static
     * @param {object} phone
     * @returns {object} JSON response
     * @memberof OnboardingService
     */
    static async sendPhoneCode(phone) {
        const result = await client
            .verify
            .services(process.env.TWILIO_SERVICE_ID)
            .verifications
            .create({
                to: phone,
                channel: 'sms'
            });
        return result;
    }

    /**
     * @method verifyPhone
     * @description
     * @static
     * @param {string} phone
     * @param {number} code
     * @returns {object} JSON response
     * @memberof OnboardingService
     */
    static async verifyPhone(phone, code) {
        const result = await client
            .verify
            .services(process.env.TWILIO_SERVICE_ID)
            .verificationChecks
            .create({
                to: phone,
                code
            });
        return result;
    }

    /**
     * @method createUser
     * @description
     * @static
     * @param {object} phone
     * @param {object} role
     * @returns {object} JSON response
     * @memberof OnboardingService
     */
    static createUser(phone, role) {
        const publicId = `PB-${Helper.generateUniqueString()}`;
        const referenceId = `RF-${Helper.generateUniqueString()}`;
        const user = {
            phone, publicId, referenceId
        };
        if (role === 'rider') {
            return Rider.create(user);
        }
        return Driver.create(user);
    }

    /**
     * @method addVerifiedUser
     * @description
     * @static
     * @param {object} user
     * @param {string} role
     * @returns {object} JSON response
     * @memberof OnboardingService
     */
    static addVerifiedUser(user, role) {
        user.publicId = `PB-${Helper.generateUniqueString()}`;
        if (role === 'rider') {
            return Rider.create(user);
        }
        return Driver.create(user);
    }

    /**
     * @method addUser
     * @description
     * @static
     * @param {object} user
     * @returns {object} JSON response
     * @memberof OnboardingService
     */
    static async addUser(user) {
        const tempUser = await Onboarding.findOne({ phone: user.phone });
        if (tempUser) await tempUser.remove();
        return Onboarding.create(user);
    }

    /**
     * @method findByPhone
     * @description
     * @static
     * @param {string} phone
     * @returns {object} JSON response
     * @memberof OnboardingService
     */
    static findByPhone(phone) {
        return Onboarding.findOne({ phone });
    }
}
