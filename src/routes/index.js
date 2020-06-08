import express from 'express';

import driverRouter from './driver';
import authRouter from './auth';
import onboardingRouter from './onboarding';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import OnboardingController from '../controllers/Onboarding';
import OnboardingMiddleware from '../middlewares/Onboarding';

const indexRouter = express.Router();

indexRouter.get('/onboarding/email_verification/:token',
    validator('email_token'),
    validate,
    OnboardingMiddleware.validateEmailVerification,
    OnboardingController.verifyEmail);

export {
    driverRouter, authRouter, onboardingRouter, indexRouter
};
