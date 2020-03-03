import httpStatus from 'http-status';

import UserService from '../services/UserService';
import Helper from '../utils/helpers/Helper';
import { uploadImage } from '../utils/helpers/image';
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
            phone,
            make,
            model,
            year,
            numberPlate,
            color,
            licenceNo,
            issueDate,
            expDate
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
            const { role } = req.params;
            let user;
            if (role === 'rider') {
                user = {
                    firstName,
                    lastName,
                    email,
                    phone,
                    password,
                    avatar: 'https://res.cloudinary.com/viola/image/upload/v1575029224/wb9azacz6mblteapgtr9.png'
                };
                req.user = user;
                return next();
            }
            const { files } = req;
            const isAvatar = await Helper.checkImage(files);
            if (!isAvatar) {
                return next(new APIError(
                    messages.noAvatarInput, httpStatus.BAD_REQUEST, true
                ));
            }
            let {
                avatar, insurance, vehiclePaper, licence
            } = files;
            const myFiles = [avatar, insurance, vehiclePaper, licence];
            myFiles.map(async file => {
                const valid = await Helper.checkImageType(file);
                if (!valid) {
                    return next(new APIError(
                        messages.noSupportType, httpStatus.BAD_REQUEST, true
                    ));
                }
            });
            avatar = await uploadImage(avatar, email, 'avatar');
            avatar = avatar.secure_url;
            insurance = await uploadImage(insurance, email, 'insurance');
            const insuranceUrl = insurance.secure_url;
            vehiclePaper = await uploadImage(vehiclePaper, email, 'vehiclePaper');
            const vehiclePaperUrl = vehiclePaper.secure_url;
            licence = await uploadImage(licence, email, 'licence');
            const licenceUrl = licence.secure_url;
            const licenceDetails = {
                licenceUrl,
                licenceNo,
                issueDate,
                expDate
            };
            const vehicleDetails = {
                make,
                model,
                year,
                color,
                numberPlate,
                insuranceUrl,
                vehiclePaperUrl,
                licenceDetails
            };
            user = {
                firstName,
                lastName,
                email,
                phone,
                password,
                avatar,
                vehicleDetails
            };
            req.user = user;
            return next();
        } catch (error) {
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
