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
                .withMessage('password must be at least 6 characters')
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
                .withMessage('role can only be "driver", "rider"')
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
                .withMessage('role can only be "driver", "rider"')
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
            body('make', 'make is required').exists(),
            body('model', 'model is required').exists(),
            body('year', 'year is required').exists(),
            body('color', 'color is required').exists(),
            body('numberPlate', 'number Plate is required').exists(),
            body('licenceNo', 'Licence is required').exists(),
            body('issueDate', 'issueDate is required').exists(),
            body('expDate', 'expDate is required').exists()
        ];
    case 'userId':
        return [
            param('userId')
                .exists()
                .withMessage('userId is required')
                .isMongoId()
                .withMessage('Please provide a valid userId')
        ];
    default:
        break;
    }
};

export default validator;
