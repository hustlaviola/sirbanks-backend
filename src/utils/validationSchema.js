import { body, query } from 'express-validator';

const validator = method => {
    switch (method) {
    case 'register':
        return [
            body('firstName', 'firstName is required and must be between'
                    + ' 2 and 50 characters inclusive')
                .exists().isLength({ min: 2, max: 50 }),
            body('lastName', 'lastName is required and must be between'
                    + ' 2 and 50 characters inclusive')
                .exists().isLength({ min: 2, max: 50 }),
            body('email', 'Please provide a valid email').isEmail(),
            body('password', 'password is required and must be at least 6 characters')
                .isLength({ min: 6 }),
            query('role', 'role is required and can only be "driver", "rider", or "admin"')
                .exists().isIn(['driver', 'rider', 'admin'])
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
    default:
        break;
    }
};

export default validator;
