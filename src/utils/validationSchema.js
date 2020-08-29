import { body, param } from 'express-validator';

const validator = method => {
    switch (method) {
    case 'register':
        return [
            // oneOf([
            //     [
            //         body('make', 'make is required').exists(),
            //         body('model', 'model is required').exists(),
            //         body('year', 'year is required').exists(),
            //         body('color', 'color is required').exists(),
            //         body('insurance', 'insurance is required').exists(),
            //         body('vehiclePaper', 'vehiclePaper is required').exists(),
            //         body('numberPlate', 'number Plate is required').exists(),
            //         body('licence', 'Licence is required').exists(),
            //         body('licenceNo', 'Licence number is required').exists(),
            //         body('issueDate', 'issueDate is required').exists(),
            //         body('expDate', 'expDate is required').exists()
            //     ],
            //     param('role').equals('rider')
            // ], 'Please fill out all car details'),
            body('firstName', 'firstName is required and must be between'
                    + ' 2 and 50 characters inclusive')
                .exists().isLength({ min: 2, max: 50 }),
            body('lastName', 'lastName is required and must be between'
                    + ' 2 and 50 characters inclusive')
                .exists().isLength({ min: 2, max: 50 }),
            body('email', 'Please provide a valid email').isEmail(),
            body('phone', 'Please provide a valid phone').exists(),
            body('password', 'password is required and must be at least 6 characters')
                .isLength({ min: 6 })
            // param('role', 'role is required and can only be "driver", "rider"')
            //     .exists().isIn(['driver', 'rider'])
        ];
    case 'phone_verification':
        return [
            body('phone')
                .isLength({ min: 1 })
                .withMessage('phone is required')
                .isMobilePhone('en-NG', { strictMode: true })
                .withMessage('please provide a valid phone number')
        ];
    case 'phone_verification_check':
        return [
            body('phone')
                .isLength({ min: 1 })
                .withMessage('phone is required')
                .isMobilePhone('en-NG', { strictMode: true })
                .withMessage('please provide a valid phone number'),
            body('otp').exists()
                .withMessage('otp is required')
                .isInt()
                .withMessage('Please provide a valid otp')
                .isLength({ min: 4, max: 4 })
                .withMessage('Please provide a valid otp'),
            param('role')
                .isLength({ min: 1 })
                .withMessage('role is required')
                .isIn(['driver', 'rider'])
                .withMessage('role can only be "driver", "rider"')
        ];
    case 'personal_details':
        return [
            body('userReference')
                .isLength({ min: 1 })
                .withMessage('userReference is required'),
            body('firstName').exists()
                .withMessage('firstName is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('firstName can only be 2 to 50 characters long')
                .isAlpha()
                .withMessage('firstName can only contain alphabets'),
            body('lastName').exists()
                .withMessage('lastName is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('lastName can only be 2 to 50 characters long')
                .isAlpha()
                .withMessage('lastName can only contain alphabets'),
            body('email').exists()
                .withMessage('email is required')
                .isEmail()
                .withMessage('Please provide a valid email'),
            body('password').exists()
                .withMessage('password is required')
                .isLength({ min: 6 })
                .withMessage('password must be at least 6 characters'),
            body('deviceToken').exists()
                .withMessage('deviceToken is required'),
            body('devicePlatform').exists()
                .withMessage('devicePlatform is required')
                .isIn(['ANDROID', 'IOS'])
                .withMessage('devicePlatform can only be "ANDROID" or "IOS"')
        ];
    case 'email_login':
        return [
            body('email')
                .isLength({ min: 1 })
                .withMessage('email is required'),
            body('password')
                .isLength({ min: 1 })
                .withMessage('password is required'),
            param('role')
                .isLength({ min: 1 })
                .withMessage('role is required')
                .isIn(['driver', 'rider'])
                .withMessage('role can only be "driver" or "rider"'),
            body('deviceToken').exists()
                .withMessage('deviceToken is required'),
            body('devicePlatform').exists()
                .withMessage('devicePlatform is required')
                .isIn(['ANDROID', 'IOS'])
                .withMessage('devicePlatform can only be "ANDROID" or "IOS"')
        ];
    case 'phone_login':
        return [
            body('phone')
                .isLength({ min: 1 })
                .withMessage('phone is required'),
            body('password')
                .isLength({ min: 1 })
                .withMessage('password is required'),
            param('role')
                .isLength({ min: 1 })
                .withMessage('role is required')
                .isIn(['driver', 'rider'])
                .withMessage('role can only be "driver", "rider"'),
            body('deviceToken').exists()
                .withMessage('deviceToken is required'),
            body('devicePlatform').exists()
                .withMessage('devicePlatform is required')
                .isIn(['ANDROID', 'IOS'])
                .withMessage('devicePlatform can only be "ANDROID" or "IOS"')
        ];
    case 'email_only':
        return [
            body('email', 'Please provide a valid email').isEmail()
        ];
    case 'password_reset':
        return [
            body('password').exists()
                .withMessage('password is required')
                .isLength({ min: 6 })
                .withMessage('password must be at least 6 characters'),
            param('token')
                .isLength({ min: 1 })
                .withMessage('token is required')
        ];
    case 'password_only':
        return [
            body('password', 'password is required and must be at least 6 characters')
                .exists().isLength({ min: 6 })
        ];
    case 'token':
        return [
            param('token')
                .exists()
                .withMessage('token is required')
        ];
    // case 'param_id':
    //     return [
    //         param('id')
    //             .exists()
    //             .withMessage('token is required')
    //             .isMongoId()
    //             .withMessage('Please provide a valid id')
    //     ];
    case 'verify_email':
        return [
            body('otp', 'otp must be 4 digits').isInt().isLength({ min: 4, max: 4 })
            // param('role', 'role is required and can only be "driver", "rider"')
            //     .exists().isIn(['driver', 'rider'])
        ];
    case 'vehicle_details':
        return [
            body('year')
                .exists()
                .withMessage('year is required')
                .isInt()
                .isLength({ min: 4, max: 4 })
                .withMessage('Please provide a valid year'),
            body('make')
                .exists()
                .withMessage('make is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('make must be in the range of 2 to 50 characters'),
            body('model')
                .exists()
                .withMessage('model is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('model must be in the range of 2 to 50 characters'),
            body('numberPlate')
                .exists()
                .withMessage('numberPlate is required')
                .isLength({ min: 2, max: 20 })
                .withMessage('numberPlate must be in the range of 2 to 20 characters'),
            body('color')
                .exists()
                .withMessage('color is required')
                .isLength({ min: 2, max: 20 })
                .withMessage('color must be in the range of 2 to 20 characters'),
            body('licenceNo')
                .exists()
                .withMessage('licenceNo is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('licenceNo must be in the range of 2 to 50 characters'),
            body('issueDate')
                .exists()
                .withMessage('issueDate is required'),
            body('expDate')
                .exists()
                .withMessage('expDate is required')
        ];
    case 'userId':
        return [
            param('userId')
                .exists()
                .withMessage('userId is required')
                .isMongoId()
                .withMessage('Please provide a valid userId')
        ];
    case 'user_onboarding':
        return [
            body('firstName')
                .exists()
                .withMessage('firstName is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('firstName must be between 2 and 50 characters inclusive'),
            body('lastName')
                .exists()
                .withMessage('lastName is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('lastName must be between 2 and 50 characters inclusive'),
            body('email')
                .exists()
                .withMessage('email is required')
                .isEmail()
                .withMessage('Please provide a valid email'),
            body('phone')
                .exists()
                .withMessage('phone is required')
                .isMobilePhone('en-NG', { strictMode: true })
                .withMessage('please provide a valid phone number with country code'),
            body('password')
                .exists()
                .withMessage('password is required')
                .isLength({ min: 6 })
                .withMessage('password must be at least 6 characters')
        ];
    case 'admin_login':
        return [
            body('email')
                .exists()
                .withMessage('email is required'),
            body('password')
                .exists()
                .withMessage('password is required')
        ];
    case 'tripId':
        return [
            param('tripId')
                .exists()
                .withMessage('tripId is required')
                .isMongoId()
                .withMessage('Please provide a valid tripId')
        ];
    case 'adminId':
        return [
            param('adminId')
                .exists()
                .withMessage('adminId is required')
                .isMongoId()
                .withMessage('Please provide a valid adminId')
        ];
    case 'cardId':
        return [
            param('cardId')
                .exists()
                .withMessage('cardId is required')
                .isMongoId()
                .withMessage('Please provide a valid cardId')
        ];
    case 'update_user':
        return [
            param('userId')
                .exists()
                .withMessage('userId is required')
                .isMongoId()
                .withMessage('Please provide a valid userId'),
            body('firstName')
                .optional()
                .isLength({ min: 2, max: 50 })
                .withMessage('firstName must be between 2 and 50 characters inclusive'),
            body('lastName')
                .optional()
                .isLength({ min: 2, max: 50 })
                .withMessage('lastName must be between 2 and 50 characters inclusive'),
            body('email')
                .optional()
                .isEmail()
                .withMessage('Please provide a valid email'),
            body('year')
                .optional()
                .isInt()
                .isLength({ min: 4, max: 4 })
                .withMessage('Please provide a valid year'),
            body('make')
                .optional()
                .isLength({ min: 2, max: 50 })
                .withMessage('make must be in the range of 2 to 50 characters'),
            body('model')
                .optional()
                .isLength({ min: 2, max: 50 })
                .withMessage('model must be in the range of 2 to 50 characters'),
            body('numberPlate')
                .optional()
                .isLength({ min: 2, max: 20 })
                .withMessage('numberPlate must be in the range of 2 to 20 characters'),
            body('color')
                .optional()
                .isLength({ min: 2, max: 20 })
                .withMessage('color must be in the range of 2 to 20 characters'),
            body('licenceNo')
                .optional()
                .isLength({ min: 2, max: 50 })
                .withMessage('licenceNo must be in the range of 2 to 50 characters')
        ];
    case 'avatar':
        return [
            body('avatar')
                .exists()
                .withMessage('avatar is required')
                // .isBase64({ urlSafe: true })
                // .withMessage('invalid avatar format')
        ];
    case 'complete_onboarding':
        return [
            body('avatar')
                .exists()
                .withMessage('avatar is required'),
            body('licence')
                .exists()
                .withMessage('licence is required'),
            body('insurance')
                .exists()
                .withMessage('insurance is required'),
            body('vehiclePaper')
                .exists()
                .withMessage('vehiclePaper is required')
        ];
    case 'add_transaction':
        return [
            body('name')
                .exists()
                .withMessage('email is required')
                .isLength({ min: 5, max: 100 })
                .withMessage('name must be between 5 and 100 characters inclusive'),
            body('reference')
                .exists()
                .withMessage('reference is required'),
            body('email')
                .exists()
                .withMessage('email is required')
                .isEmail()
                .withMessage('Please provide a valid email'),
            body('amount')
                .exists()
                .withMessage('amount is required')
                .isNumeric()
                .withMessage('please provide a valid amount'),
            body('type')
                .exists()
                .withMessage('type is required')
                .isIn(['fund_wallet', 'add_card', 'payment', 'payout'])
                .withMessage('invalid type')
        ];
    // case 'get_users':
    //     return [
    //         param('role')
    //             .isLength({ min: 1 })
    //             .withMessage('role is required')
    //             .isIn(['drivers', 'riders'])
    //             .withMessage('role can only be "driver", "rider"')
    //     ];
    default:
        break;
    }
};

export default validator;
