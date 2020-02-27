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
                .isLength({ min: 6 })
        ];
    default:
        break;
    }
};

export default validator;
