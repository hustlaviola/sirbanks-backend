import sgMail from '@sendgrid/mail';
import { mail, mailGenerator } from './helpers/email';

/**
 * @function sendOtpMail
 * @description Send email to a recipient
 * @static
 * @param {String} email
 * @param {String} subject - Email message
 * @param {Object} instructions
 * @returns {object} JSON response
 */
export const sendOtpMail = async (email, subject, instructions) => {
    // const emailBody = otpMail(name, intro, instructions);
    // const emailTemplate = await mailGenerator.generate(emailBody);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: email,
        from: 'no-reply@sirbanks.com',
        subject,
        text: instructions
    };
    await sgMail.send(msg);
};

/**
 * @function sendMail
 * @description Send email to a recipient
 * @static
 * @param {String} name - Recipient name
 * @param {String} email - Recipient email
 * @param {String} subject - Email subject
 * @param {String} intro - Introductory message
 * @param {Object} action
 * @param {Object} secondAction
 * @returns {object} JSON response
 */
const sendMail = async (name, email, subject, intro, action, secondAction = undefined) => {
    const emailBody = mail(name, intro, action, secondAction);
    const emailTemplate = await mailGenerator.generate(emailBody);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: email,
        from: 'no-reply@sirbanks.com',
        subject,
        html: emailTemplate
    };
    await sgMail.send(msg);
};

export default sendMail;
