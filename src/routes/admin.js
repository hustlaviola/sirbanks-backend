import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import AdminMiddleware from '../middlewares/Admin';
import AdminController from '../controllers/Admin';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';

const router = express.Router();

router.post('/onboarding',
    AuthValidator.userAuth,
    validator('admin_onboading'),
    validate,
    AdminMiddleware.validateAdminOnboarding,
    AdminController.onboardAdmin);

router.post('/login',
    validator('admin_login'),
    validate,
    AdminMiddleware.validateAdminLogin,
    AdminController.adminLogin);

router.patch('/upload_avatar',
    AuthValidator.userAuth,
    UserValidator.validateAvatarUpload,
    UserController.uploadAvatar);

router.get('/drivers',
    AuthValidator.userAuth,
    AdminMiddleware.validateGetUsers,
    AdminController.getUsers);

router.get('/riders',
    AuthValidator.userAuth,
    AdminMiddleware.validateGetUsers,
    AdminController.getUsers);

router.get('/drivers/:userId',
    AuthValidator.userAuth,
    validator('userId'),
    validate,
    AdminMiddleware.validateGetUser,
    AdminController.getUser);

router.get('/riders/:userId',
    AuthValidator.userAuth,
    validator('userId'),
    validate,
    AdminMiddleware.validateGetUser,
    AdminController.getUser);

router.get('/drivers/:userId/trips',
    AuthValidator.userAuth,
    validator('userId'),
    validate,
    UserValidator.validateGetUserTrips,
    UserController.getUserTrips);

router.get('/riders/:userId/trips',
    AuthValidator.userAuth,
    validator('userId'),
    validate,
    UserValidator.validateGetUserTrips,
    UserController.getUserTrips);

// router.get('/drivers/:userId/trips/:tripId',
//     AuthValidator.userAuth,
//     validator('userId_trip'),
//     validate,
//     AdminMiddleware.validateGetUser,
//     AdminController.getUser);

export default router;
