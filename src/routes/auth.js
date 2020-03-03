import express from 'express';

import AuthValidator from '../middlewares/Auth';
import AuthController from '../controllers/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';

const router = express.Router();

router.get('/email_verification/:token',
    AuthValidator.validateParamToken,
    AuthController.verifyEmailOrRenderReset);

router.get('/phone_verification',
    AuthController.sendPhoneCode);

router.get('/verify_phone',
    AuthController.verifyPhone);

router.post('/login',
    AuthValidator.validateLogin,
    AuthController.login);

router.post('/resend',
    validator('email_only'),
    validate,
    AuthValidator.validateEmailVerification,
    AuthController.emailVerificationOrResetPassword);

router.post('/forgot_password',
    validator('email_only'),
    validate,
    AuthValidator.validateEmailVerification,
    AuthController.emailVerificationOrResetPassword);

router.get('/reset_password/:token',
    AuthValidator.validateParamToken,
    AuthController.verifyEmailOrRenderReset);

router.post('/reset_password/:token',
    validator('password_only'),
    validate,
    AuthValidator.validateParamToken,
    AuthController.resetPassword);

export default router;
