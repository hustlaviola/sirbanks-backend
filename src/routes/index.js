import express from 'express';

import driverRouter from './driver';
import authRouter from './auth';
import onboardingRouter from './onboarding';
import userRouter from './user';
import adminRouter from './admin';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import AuthValidator from '../middlewares/Auth';
import AuthController from '../controllers/Auth';

const indexRouter = express.Router();

indexRouter.get('/auth/email_verification/:token',
    validator('token'),
    validate,
    AuthValidator.validateToken,
    AuthController.verifyEmail);

indexRouter.get('/auth/password_reset/:token',
    validator('token'),
    validate,
    AuthValidator.validateToken,
    AuthController.renderResetPage);

indexRouter.post('/auth/password_reset/:token',
    validator('password_reset'),
    validate,
    AuthValidator.validateToken,
    AuthController.resetPassword);

export {
    driverRouter, authRouter, onboardingRouter, indexRouter, userRouter, adminRouter
};
