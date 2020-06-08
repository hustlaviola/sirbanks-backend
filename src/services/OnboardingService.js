import twilio from 'twilio';
import { v4 as uuid } from 'uuid';

import Rider from '../models/Rider';
import Driver from '../models/Driver';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @class
 * @description Authentication middleware class
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
        const myPublicId = `PB-${uuid()}`;
        const referenceId = `RF-${uuid()}`;
        const user = {
            phone, myPublicId, referenceId
        };
        if (role === 'rider') {
            return Rider.create(user);
        }
        return Driver.create(user);
    }
}
