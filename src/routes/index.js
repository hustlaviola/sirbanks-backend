import express from 'express';

import driverRouter from './driver';
import authRouter from './auth';
import onboardingRouter from './onboarding';
import userRouter from './user';
import adminRouter from './admin';
import tripRouter from './trip';
import transactionRouter from './transaction';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import AuthValidator from '../middlewares/Auth';
import AuthController from '../controllers/Auth';
import AdminController from '../controllers/Admin';
import AdminMiddleware from '../middlewares/Admin';

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

indexRouter.get('/api/v1/makes',
    AdminMiddleware.validateGetMakes,
    AdminController.getMakes);

indexRouter.get('/api/v1/makes/:makeId/models',
    AdminMiddleware.validateGetModels,
    AdminController.getModels);

export {
    driverRouter,
    authRouter,
    onboardingRouter,
    indexRouter,
    userRouter,
    adminRouter,
    tripRouter,
    transactionRouter
};
