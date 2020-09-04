/* eslint-disable no-plusplus */
import httpStatus from 'http-status';
import { v4 as uuid } from 'uuid';
import isBase64 from 'is-base64';

import UserService from '../services/UserService';
import Helper from '../utils/helpers/Helper';
import uploadImage, { uploadBase64Image } from '../utils/helpers/image';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';
import AdminService from '../services/AdminService';
import AuthService from '../services/AuthService';

const log = debug('app:onboarding-middleware');

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
            const publicId = uuid();
            const user = {
                firstName,
                lastName,
                email,
                phone,
                password,
                publicId,
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
            log(error);
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
                numberPlate,
                color,
                licenceNo
            } = req.body;
            let { year, issueDate, expDate } = req.body;
            year = parseInt(year, 10);
            const thisYear = new Date().getFullYear();
            if (year < 1990 || year > thisYear) {
                return next(new APIError(
                    `year can only be in the range of 1990 and ${thisYear}`, httpStatus.BAD_REQUEST, true
                ));
            }
            if (!Helper.isValidDate(issueDate)) {
                return next(new APIError(
                    messages.invalidIssueDate, httpStatus.BAD_REQUEST, true
                ));
            }
            if (!Helper.isValidDate(expDate)) {
                return next(new APIError(
                    messages.invalidExpDate, httpStatus.BAD_REQUEST, true
                ));
            }
            issueDate = new Date(issueDate);
            expDate = new Date(expDate);
            if (expDate < issueDate) {
                return next(new APIError(
                    'expDate cannot come before issueDate', httpStatus.BAD_REQUEST, true
                ));
            }
            if (expDate < Date.now()) {
                return next(new APIError(
                    'expDate cannot come before the present date', httpStatus.BAD_REQUEST, true
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
            const { reference } = req.params;
            let user;
            let isAdmin = false;
            if (req.user.permissions) {
                if (req.user.permissions < 3) {
                    return next(new APIError(
                        messages.unauthorized, httpStatus.UNAUTHORIZED, true
                    ));
                }
                if (!reference) {
                    return next(new APIError(
                        'reference is required', httpStatus.BAD_REQUEST, true
                    ));
                }
                const isValidRef = Helper.isValidKey(reference, 'RF-');
                if (!isValidRef) {
                    return next(new APIError(
                        messages.invalidUserRef, httpStatus.BAD_REQUEST, true
                    ));
                }
                isAdmin = true;
                user = await UserService.findByReferenceNRole(reference, 'driver');
            } else {
                user = await UserService.findByIdAndRole(req.user.id, 'driver');
            }
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
            user.onboardingStatus = 'vehicle_details';
            await user.save();
            req.dbUser = user;
            req.isAdmin = isAdmin;
            return next();
        } catch (error) {
            log(error);
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
            // const { files } = req;
            const { reference } = req.params;
            let user;
            let isAdmin = false;
            if (req.user.permissions) {
                if (req.user.permissions < 3) {
                    return next(new APIError(
                        messages.unauthorized, httpStatus.UNAUTHORIZED, true
                    ));
                }
                if (!reference) {
                    return next(new APIError(
                        'reference is required', httpStatus.BAD_REQUEST, true
                    ));
                }
                const isValidRef = Helper.isValidKey(reference, 'RF-');
                if (!isValidRef) {
                    return next(new APIError(
                        messages.invalidUserRef, httpStatus.BAD_REQUEST, true
                    ));
                }
                isAdmin = true;
                user = await UserService.findByReferenceNRole(reference, 'driver');
            } else {
                user = await UserService.findByIdAndRole(req.user.id, 'driver');
            }
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            if (req.url.includes('complete') && user.onboardingStatus === 'completed') {
                return next(new APIError(
                    messages.alreadyCompletedOnboarding, httpStatus.BAD_REQUEST, true
                ));
            }
            if (req.url.includes('complete') && user.onboardingStatus !== 'vehicle_details') {
                return next(new APIError(
                    'Please update your vehicle details', httpStatus.BAD_REQUEST, true
                ));
            }
            // const expectedFileKeys = ['avatar', 'licence', 'insurance', 'vehiclePaper'];
            const {
                avatar, licence, insurance, vehiclePaper
            } = req.body;
            if (!isBase64(avatar, { mimeRequired: true })) {
                return next(new APIError(
                    'Invalid avatar format', httpStatus.BAD_REQUEST, true
                ));
            }
            if (!isBase64(licence, { mimeRequired: true })) {
                return next(new APIError(
                    'Invalid licence format', httpStatus.BAD_REQUEST, true
                ));
            }
            if (!isBase64(insurance, { mimeRequired: true })) {
                return next(new APIError(
                    'Invalid insurance format', httpStatus.BAD_REQUEST, true
                ));
            }
            if (!isBase64(vehiclePaper, { mimeRequired: true })) {
                return next(new APIError(
                    'Invalid vehiclePaper format', httpStatus.BAD_REQUEST, true
                ));
            }
            // const myFiles = [avatar, licence, insurance, vehiclePaper];
            // const errMessages = [];
            // for (let i = 0; i < expectedFileKeys.length; i++) {
            //     if (!files[expectedFileKeys[i]]
            // || files[expectedFileKeys[i]].mimetype === 'text/plain') {
            //         errMessages.push(`${expectedFileKeys[i]} is required`);
            //     } else if (!(myFiles[i].mimetype === 'image/png'
            //         || myFiles[i].mimetype === 'image/jpeg')) {
            //         errMessages.push(`${expectedFileKeys[i]} file format not supported`);
            //     }
            // }
            // if (errMessages.length > 0) {
            //     return next(new APIError(
            //         errMessages, httpStatus.BAD_REQUEST, true
            //     ));
            // }
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
                uploadBase64Image(avatar, user.publicId, 'avatar'),
                uploadBase64Image(licence, user.publicId, 'licence'),
                uploadBase64Image(insurance, user.publicId, 'insurance'),
                uploadBase64Image(vehiclePaper, user.publicId, 'vehiclePaper')
            ];
            const values = await Promise.all(tasks);
            user.avatar = values[0].secure_url;
            user.vehicleDetails.licenceDetails.licenceUrl = values[1].secure_url;
            user.vehicleDetails.insuranceUrl = values[2].secure_url;
            user.vehicleDetails.vehiclePaperUrl = values[3].secure_url;
            user.onboardingStatus = 'completed';
            await user.save();
            req.dbUser = user;
            req.isAdmin = isAdmin;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateFiles
     * @description Validates driver file uploads
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserValidator
     */
    static async validateFiles(req, res, next) {
        try {
            const { files } = req;
            const { reference } = req.params;
            let user;
            let isAdmin = false;
            if (req.user.permissions) {
                if (req.user.permissions < 3) {
                    return next(new APIError(
                        messages.unauthorized, httpStatus.UNAUTHORIZED, true
                    ));
                }
                if (!reference) {
                    return next(new APIError(
                        'reference is required', httpStatus.BAD_REQUEST, true
                    ));
                }
                const isValidRef = Helper.isValidKey(reference, 'RF-');
                if (!isValidRef) {
                    return next(new APIError(
                        messages.invalidUserRef, httpStatus.BAD_REQUEST, true
                    ));
                }
                isAdmin = true;
                user = await UserService.findByReferenceNRole(reference, 'driver');
            } else {
                user = await UserService.findByIdAndRole(req.user.id, 'driver');
            }
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            if (req.url.includes('complete') && user.onboardingStatus === 'completed') {
                return next(new APIError(
                    messages.alreadyCompletedOnboarding, httpStatus.BAD_REQUEST, true
                ));
            }
            if (req.url.includes('complete') && user.onboardingStatus !== 'vehicle_details') {
                return next(new APIError(
                    'Please update your vehicle details', httpStatus.BAD_REQUEST, true
                ));
            }
            const expectedFileKeys = ['avatar', 'licence', 'insurance', 'vehiclePaper'];
            if (!files) {
                return next(new APIError(
                    'avatar, licence, insurance and vehiclePaper are required', httpStatus.BAD_REQUEST, true
                ));
            }
            const {
                avatar, licence, insurance, vehiclePaper
            } = req.files;
            // if (!isBase64(avatar, { mimeRequired: true })) {
            //     return next(new APIError(
            //         'Invalid avatar format', httpStatus.BAD_REQUEST, true
            //     ));
            // }
            // if (!isBase64(licence, { mimeRequired: true })) {
            //     return next(new APIError(
            //         'Invalid licence format', httpStatus.BAD_REQUEST, true
            //     ));
            // }
            // if (!isBase64(insurance, { mimeRequired: true })) {
            //     return next(new APIError(
            //         'Invalid insurance format', httpStatus.BAD_REQUEST, true
            //     ));
            // }
            // if (!isBase64(vehiclePaper, { mimeRequired: true })) {
            //     return next(new APIError(
            //         'Invalid vehiclePaper format', httpStatus.BAD_REQUEST, true
            //     ));
            // }
            const myFiles = [avatar, licence, insurance, vehiclePaper];
            log(avatar);
            log(licence);
            log(insurance);
            log(vehiclePaper);
            const errMessages = [];
            for (let i = 0; i < expectedFileKeys.length; i++) {
                if (!files[expectedFileKeys[i]]
            || files[expectedFileKeys[i]].mimetype === 'text/plain') {
                    errMessages.push(`${expectedFileKeys[i]} is required`);
                } else if (!(myFiles[i].mimetype === 'image/png'
                    || myFiles[i].mimetype === 'image/jpeg')) {
                    errMessages.push(`${expectedFileKeys[i]} file format not supported`);
                }
            }
            if (errMessages.length > 0) {
                return next(new APIError(
                    errMessages, httpStatus.BAD_REQUEST, true
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
                uploadImage(avatar, user.publicId, 'avatar'),
                uploadImage(licence, user.publicId, 'licence'),
                uploadImage(insurance, user.publicId, 'insurance'),
                uploadImage(vehiclePaper, user.publicId, 'vehiclePaper')
            ];
            // const tasks = [
            //     uploadBase64Image(avatar, user.publicId, 'avatar'),
            //     uploadBase64Image(licence, user.publicId, 'licence'),
            //     uploadBase64Image(insurance, user.publicId, 'insurance'),
            //     uploadBase64Image(vehiclePaper, user.publicId, 'vehiclePaper')
            // ];
            const values = await Promise.all(tasks);
            user.avatar = values[0].secure_url;
            user.vehicleDetails.licenceDetails.licenceUrl = values[1].secure_url;
            user.vehicleDetails.insuranceUrl = values[2].secure_url;
            user.vehicleDetails.vehiclePaperUrl = values[3].secure_url;
            user.onboardingStatus = 'completed';
            await user.save();
            req.dbUser = user;
            req.isAdmin = isAdmin;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateGetUserTrips
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserValidator
     */
    static async validateGetUserTrips(req, res, next) {
        const { id, permissions } = req.user;
        let { role } = req.user;
        const { userId } = req.params;
        try {
            if (permissions) {
                role = req.url.includes('drivers') ? 'driver' : 'rider';
            } else {
                const user = await UserService.findById(id);
                if (!user) {
                    return next(new APIError(
                        messages.userNotFound, httpStatus.NOT_FOUND, true
                    ));
                }
                if (id.toString() !== userId.toString()) {
                    return next(new APIError(
                        messages.unauthorized, httpStatus.UNAUTHORIZED, true
                    ));
                }
            }
            const trips = await UserService.getUserTrips(userId, role);
            const tripsDTO = Helper.formatTrips(trips, id);
            req.trips = tripsDTO;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateAvatarUpload
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof UserValidator
     */
    static async validateAvatarUpload(req, res, next) {
        try {
            const { id, role, permissions } = req.user;
            // const { files } = req;
            const { avatar } = req.body;
            if (!isBase64(avatar, { mimeRequired: true })) {
                return next(new APIError(
                    'Invalid avatar format', httpStatus.BAD_REQUEST, true
                ));
            }
            // const mats = avatar.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
            // log('============', mats[0]);
            // if (!files) {
            //     return next(new APIError(
            //         messages.avatarRequired, httpStatus.BAD_REQUEST, true
            //     ));
            // }
            // const { avatar } = files;
            // if (!avatar) {
            //     return next(new APIError(
            //         messages.avatarRequired, httpStatus.BAD_REQUEST, true
            //     ));
            // }
            // if (!(avatar.mimetype === 'image/png' || avatar.mimetype === 'image/jpeg')) {
            //     return next(new APIError(
            //         messages.noSupportType, httpStatus.BAD_REQUEST, true
            //     ));
            // }
            let user;
            if (permissions) {
                user = await AdminService.findById(id);
            } else {
                user = await UserService.findByIdAndRole(id, role);
            }
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            const result = await uploadBase64Image(avatar, user.publicId, 'avatar', permissions ? 'admin' : role);
            user.avatar = result.secure_url;
            await user.save();
            req.user = user;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    // /**
    //  * @method validateGetUserTransactionHistory
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof UserValidator
    //  */
    // static async validateGetUserTransactionHistory(req, res, next) {
    //     const { id, role } = req.user;
    //     const { userId } = req.params;
    //     try {
    //         const user = await UserService.findById(id);
    //         if (!user) {
    //             return next(new APIError(
    //                 messages.userNotFound, httpStatus.NOT_FOUND, true
    //             ));
    //         }
    //         if (id.toString() !== userId.toString() || user.permissions < 1) {
    //             return next(new APIError(
    //                 messages.unauthorized, httpStatus.UNAUTHORIZED, true
    //             ));
    //         }
    //         const transactions = await UserService.getUserTrips(userId, role);
    //         const tripsDTO = Helper.formatTrips(trips, id);
    //         req.trips = tripsDTO;
    //         return next();
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }

    /**
     * @method validateUsersCount
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof User
     */
    static async validateUsersCount(req, res, next) {
        if (!req.user.permissions) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            const count = await UserService.getUsersCount();
            req.totalUsers = count;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateDriversCount
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof User
     */
    static async validateDriversCount(req, res, next) {
        if (!req.user.permissions) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            const count = await UserService.getDriversCount();
            req.totalDrivers = count;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateOnlineDrivers
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof User
     */
    static async validateOnlineDrivers(req, res, next) {
        if (!req.user.permissions) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            const onlineDrivers = await UserService.getOnlineDrivers();
            req.onlineDrivers = onlineDrivers;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateUserUpdate
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof User
     */
    static async validateUserUpdate(req, res, next) {
        if (!req.user.permissions || req.user.permissions < 3) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            let role = 'rider';
            if (req.url.includes('drivers')) role = 'driver';
            const user = await UserService.findByIdAndRole(req.params.userId, role);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            const {
                email,
                firstName,
                lastName,
                make,
                model,
                numberPlate,
                color,
                licenceNo
            } = req.body;
            let { year, issueDate, expDate } = req.body;
            if (year) {
                year = parseInt(year, 10);
                const thisYear = new Date().getFullYear();
                if (year < 1990 || year > thisYear) {
                    return next(new APIError(
                        `year must be in the range of 1990 to ${thisYear}`, httpStatus.BAD_REQUEST, true
                    ));
                }
                if (user.vehicleDetails) user.vehicleDetails.year = year;
            }
            if (issueDate) {
                if (!Helper.isValidDate(issueDate)) {
                    return next(new APIError(
                        messages.invalidIssueDate, httpStatus.BAD_REQUEST, true
                    ));
                }
                issueDate = new Date(issueDate);
                if (user.vehicleDetails && user.vehicleDetails.licenceDetails) {
                    user.vehicleDetails.licenceDetails.issueDate = issueDate;
                }
            }
            if (expDate) {
                if (!Helper.isValidDate(expDate)) {
                    return next(new APIError(
                        messages.invalidExpDate, httpStatus.BAD_REQUEST, true
                    ));
                }
                expDate = new Date(expDate);
                if (user.vehicleDetails && user.vehicleDetails.licenceDetails) {
                    if (expDate < user.vehicleDetails.licenceDetails.issueDate) {
                        return next(new APIError(
                            'expDate cannot come before issueDate', httpStatus.BAD_REQUEST, true
                        ));
                    }
                    user.vehicleDetails.licenceDetails.expDate = expDate;
                }
                if (expDate < Date.now()) {
                    return next(new APIError(
                        'expDate cannot come before the present date', httpStatus.BAD_REQUEST, true
                    ));
                }
            }
            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            if (email) {
                if (email !== user.email) {
                    user.email = email;
                    const token = await AuthService.createRegToken(user.id, 'email');
                    Helper.sendEmailLink(user.firstName, email, token.token, req.headers.host, 'email')
                        .catch(err => log(err));
                }
            }
            if (make && user.vehicleDetails) user.vehicleDetails.make = make;
            if (model && user.vehicleDetails) user.vehicleDetails.model = model;
            if (numberPlate && user.vehicleDetails) user.vehicleDetails.numberPlate = numberPlate;
            if (color && user.vehicleDetails) user.vehicleDetails.color = color;
            if (licenceNo && user.vehicleDetails && user.vehicleDetails.licenceDetails) {
                user.vehicleDetails.licenceDetails.licenceNo = licenceNo;
            }
            await user.save();
            req.role = role;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateGetAvatar
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof User
     */
    static async validateGetAvatar(req, res, next) {
        try {
            const user = await UserService.getAvatar(req.user.id, req.user.role);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            req.avatar = user.avatar;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateGetWalletBalance
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof User
     */
    static async validateGetWalletBalance(req, res, next) {
        try {
            const user = await UserService.getWalletBalance(req.user.id, req.user.role);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            req.walletBalance = user.walletBalance;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
