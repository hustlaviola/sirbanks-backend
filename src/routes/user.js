import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';

const router = express.Router();

router.get('/:userId/trips',
    AuthValidator.userAuth,
    validator('userId'),
    validate,
    UserValidator.validateGetUserTrips,
    UserController.getUserTrips);

router.patch('/upload_avatar',
    AuthValidator.userAuth,
    UserValidator.validateAvatarUpload,
    UserController.uploadAvatar);

// router.get('/:userId/transactions',
//     AuthValidator.userAuth,
//     validator('userId'),
//     validate,
//     UserValidator.validateGetUserTransactionHistory,
//     UserController.getUserTransactionHistory);

export default router;
