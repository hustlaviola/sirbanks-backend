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

router.post('/onboarding/vehicle_details',
    AuthValidator.userAuth,
    validator('vehicle_details'),
    validate,
    UserValidator.validateVehicleDetails,
    UserController.updateVehicleDetails);

router.post('/onboarding/complete',
    AuthValidator.userAuth,
    UserValidator.validateFileUploads,
    UserController.upLoadDriverFiles);

export default router;
