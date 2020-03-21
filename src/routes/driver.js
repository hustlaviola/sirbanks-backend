import express from 'express';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';
import AuthValidator from '../middlewares/Auth';

const router = express.Router();

router.post('/onboarding/initiate',
    validator('register'),
    validate,
    UserValidator.validateUserReg,
    UserController.register);

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
