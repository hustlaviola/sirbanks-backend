/* eslint-disable no-plusplus */
import httpStatus from 'http-status';
import { v4 as uuid } from 'uuid';

import UserService from '../services/UserService';
import Helper from '../utils/helpers/Helper';
import uploadImage from '../utils/helpers/image';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';

/**
 * @class
 * @description User middleware class
 * @exports UserValidator
 */
export default class UserValidator {
    /**
     * @method validateUserReg
     * @description Validates User registration credentials
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserValidator
     */
    static async validateUserReg(req, res, next) {
        const {
            firstName,
            lastName,
            email,
            phone
        } = req.body;
        try {
            const isEmail = await UserService.findByEmail(email);
            if (isEmail) {
                return next(new APIError(
                    messages.emailInUse, httpStatus.CONFLICT, true
                ));
            }
            const isPhone = await UserService.findByPhone(phone);
            if (isPhone) {
                return next(new APIError(
                    messages.phoneInUse, httpStatus.CONFLICT, true
                ));
            }
            let { password } = req.body;
            password = await Helper.encryptPassword(password);
            const myPublicId = uuid();
            const user = {
                firstName,
                lastName,
                email,
                phone,
                password,
                myPublicId,
                avatar: 'https://res.cloudinary.com/viola/image/upload/v1575029224/wb9azacz6mblteapgtr9.png'
            };
            req.isDriver = false;
            req.role = 'rider';
            if (req.url.includes('initiate')) {
                user.onboardingStatus = 'initiated';
                req.isDriver = true;
                req.role = 'driver';
            }
            req.user = user;
            return next();
        } catch (error) {
            console.error(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateVehicleDetails
     * @description Validates vehicle details
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserValidator
     */
    static async validateVehicleDetails(req, res, next) {
        try {
            const {
                make,
                model,
                year,
                numberPlate,
                color,
                licenceNo,
                issueDate,
                expDate
            } = req.body;
            const isValidIssue = await Helper.isValidDate(issueDate);
            if (!isValidIssue) {
                return next(new APIError(
                    messages.invalidIssueDate, httpStatus.BAD_REQUEST, true
                ));
            }
            const isValidExp = await Helper.isValidDate(expDate);
            if (!isValidExp) {
                return next(new APIError(
                    messages.invalidExpDate, httpStatus.BAD_REQUEST, true
                ));
            }
            const licenceDetails = { licenceNo, issueDate, expDate };
            const vehicleDetails = {
                make,
                model,
                year,
                color,
                numberPlate,
                licenceDetails
            };
            const user = await UserService.findById(req.user.id, 'driver');
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            if (user.onboardingStatus === 'vehicle_details' || user.onboardingStatus === 'completed') {
                return next(new APIError(
                    messages.alreadyUpdateVehicleDetails, httpStatus.BAD_REQUEST, true
                ));
            }
            user.vehicleDetails = vehicleDetails;
            req.user = user;
            return next();
        } catch (error) {
            console.error(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateFileUploads
     * @description Validates driver file uploads
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserValidator
     */
    static async validateFileUploads(req, res, next) {
        try {
            const { files } = req;
            const user = await UserService.findById(req.user.id, 'driver');
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            // if (user.onboardingStatus === 'completed') {
            //     return next(new APIError(
            //         messages.alreadyCompletedOnboarding, httpStatus.BAD_REQUEST, true
            //     ));
            // }
            const expectedFileKeys = ['avatar', 'licence', 'insurance', 'vehiclePaper'];
            const {
                avatar, insurance, vehiclePaper, licence
            } = files;
            const myFiles = [avatar, licence, insurance, vehiclePaper];
            const errMessages = [];
            for (let i = 0; i < expectedFileKeys.length; i++) {
                if (!files[expectedFileKeys[i]] || files[expectedFileKeys[i]].mimetype === 'text/plain') {
                    errMessages.push(`${expectedFileKeys[i]} is required`);
                } else if (!(myFiles[i].mimetype === 'image/png'
                    || myFiles[i].mimetype === 'image/jpeg')) {
                    errMessages.push(`${expectedFileKeys[i]} file format not supported`);
                }
            }
            if (errMessages.length > 0) {
                return next(new APIError(
                    errMessages.join('\n'), httpStatus.BAD_REQUEST, true
                ));
            }
            // const start = Date.now();
            // const avatar2 = await uploadImage(avatar, user.email, 'avatar');
            // // avatar = avatar.secure_url;
            // const insurance2 = await uploadImage(insurance, user.email, 'insurance');
            // // const insuranceUrl = insurance.secure_url;
            // const vehiclePaper2 = await uploadImage(vehiclePaper, user.email, 'vehiclePaper');
            // // const vehiclePaperUrl = vehiclePaper.secure_url;
            // const licence2 = await uploadImage(licence, user.email, 'licence');
            // // const licenceUrl = licence.secure_url;
            // const mark = Date.now() - start;
            // console.log(mark);
            // console.log(process.memoryUsage());
            const tasks = [
                uploadImage(avatar, user.myPublicId, 'avatar'),
                uploadImage(licence, user.myPublicId, 'licence'),
                uploadImage(insurance, user.myPublicId, 'insurance'),
                uploadImage(vehiclePaper, user.myPublicId, 'vehiclePaper')
            ];
            const values = await Promise.all(tasks);
            user.avatar = values[0].secure_url;
            user.vehicleDetails.licenceDetails.licenceUrl = values[1].secure_url;
            user.vehicleDetails.insuranceUrl = values[2].secure_url;
            user.vehicleDetails.vehiclePaperUrl = values[3].secure_url;
            user.onboardingStatus = 'completed';
            req.user = user;
            return next();
        } catch (error) {
            console.error(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
