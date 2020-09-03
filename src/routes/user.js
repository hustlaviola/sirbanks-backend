import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';
import AdminMiddleware from '../middlewares/Admin';
import AdminController from '../controllers/Admin';

const router = express.Router();

router.get('/count',
    AuthValidator.userAuth,
    UserValidator.validateUsersCount,
    UserController.getUsersCount);

router.get('/:userId/trips',
    AuthValidator.userAuth,
    validator('userId'),
    validate,
    UserValidator.validateGetUserTrips,
    UserController.getUserTrips);

router.get('/avatar',
    AuthValidator.userAuth,
    UserValidator.validateGetAvatar,
    UserController.getAvatar);

router.get('/wallet_balance',
    AuthValidator.userAuth,
    UserValidator.validateGetWalletBalance,
    UserController.getWalletBalance);

router.patch('/upload_avatar',
    AuthValidator.userAuth,
    validator('avatar'),
    validate,
    UserValidator.validateAvatarUpload,
    UserController.uploadAvatar);

router.delete('/riders/:userId',
    AuthValidator.userAuth,
    AdminMiddleware.validateDeleteUser,
    AdminController.deleteUser);

router.delete('/drivers/:userId',
    AuthValidator.userAuth,
    AdminMiddleware.validateDeleteUser,
    AdminController.deleteUser);

// router.get('/:userId/transactions',
//     AuthValidator.userAuth,
//     validator('userId'),
//     validate,
//     UserValidator.validateGetUserTransactionHistory,
//     UserController.getUserTransactionHistory);

export default router;
