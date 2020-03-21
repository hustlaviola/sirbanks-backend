import { body } from 'express-validator';

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
    case 'email_only':
        return [
            body('email', 'Please provide a valid email').isEmail()
        ];
    case 'password_only':
        return [
            body('password', 'password is required and must be at least 6 characters')
                .exists().isLength({ min: 6 })
        ];
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
    default:
        break;
    }
};

export default validator;
