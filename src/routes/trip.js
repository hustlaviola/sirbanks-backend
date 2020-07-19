import express from 'express';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import AuthValidator from '../middlewares/Auth';
import TripController from '../controllers/Trip';
import TripMiddleware from '../middlewares/Trip';

const router = express.Router();

router.get('/:tripId',
    AuthValidator.userAuth,
    validator('tripId'),
    validate,
    TripMiddleware.validateGetTrip,
    TripController.getTrip);

export default router;
