import express from 'express';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';
import AuthValidator from '../middlewares/Auth';

const router = express.Router();

router.get('/count',
    AuthValidator.userAuth,
    UserValidator.validateDriversCount,
    UserController.getDriversCount);

router.get('/online',
    AuthValidator.userAuth,
    UserValidator.validateOnlineDrivers,
    UserController.getOnlineDrivers);

router.put('/profile_completion',
    AuthValidator.userAuth,
    validator('profile_completion'),
    validate,
    UserValidator.validateCompleteProfile,
    UserController.completeProfile);

router.put('/onboarding/vehicle_details',
    AuthValidator.userAuth,
    validator('vehicle_details'),
    validate,
    UserValidator.validateVehicleDetails,
    UserController.updateVehicleDetails);

router.put('/onboarding/complete',
    AuthValidator.userAuth,
    UserValidator.validateFiles,
    UserController.upLoadDriverFiles);

export default router;
