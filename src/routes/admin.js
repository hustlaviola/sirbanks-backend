import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import AdminMiddleware from '../middlewares/Admin';
import AdminController from '../controllers/Admin';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';

const router = express.Router();

router.get('/',
    AuthValidator.userAuth,
    AdminMiddleware.validateGetAdmins,
    AdminController.getAdmins);

router.get('/:adminId',
    AuthValidator.userAuth,
    validator('adminId'),
    validate,
    AdminMiddleware.validateGetAdmin,
    AdminController.getAdmin);

router.post('/onboarding',
    AuthValidator.userAuth,
    validator('user_onboarding'),
    validate,
    AdminMiddleware.validateAdminOnboarding,
    AdminController.onboardAdmin);

router.post('/drivers/onboarding',
    AuthValidator.userAuth,
    validator('user_onboarding'),
    validate,
    AdminMiddleware.validateAddUser,
    AdminController.addUser);

router.post('/riders/onboarding',
    AuthValidator.userAuth,
    validator('user_onboarding'),
    validate,
    AdminMiddleware.validateAddUser,
    AdminController.addUser);

router.put('/drivers/:reference/onboarding/vehicle_details',
    AuthValidator.userAuth,
    validator('vehicle_details'),
    validate,
    UserValidator.validateVehicleDetails,
    UserController.updateVehicleDetails);

router.put('/drivers/:reference/onboarding/complete',
    AuthValidator.userAuth,
    UserValidator.validateFiles,
    UserController.upLoadDriverFiles);

router.post('/login',
    validator('admin_login'),
    validate,
    AdminMiddleware.validateAdminLogin,
    AdminController.adminLogin);

router.patch('/upload_avatar',
    AuthValidator.userAuth,
    validator('avatar'),
    validate,
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

router.put('/riders/:userId/',
    AuthValidator.userAuth,
    validator('update_user'),
    validate,
    UserValidator.validateUserUpdate,
    UserController.updateUser);

router.put('/drivers/:userId/',
    AuthValidator.userAuth,
    validator('update_user'),
    validate,
    UserValidator.validateUserUpdate,
    UserController.updateUser);

// router.get('/addem',
//     AuthValidator.userAuth,
//     AdminController.addCars);

// router.get('/drivers/:userId/trips/:tripId',
//     AuthValidator.userAuth,
//     validator('userId_trip'),
//     validate,
//     AdminMiddleware.validateGetUser,
//     AdminController.getUser);

export default router;
