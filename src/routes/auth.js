import express from 'express';

import AuthValidator from '../middlewares/Auth';
import AuthController from '../controllers/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';

const router = express.Router();

router.get('/email_verification/:role/:token',
    AuthValidator.validateParamToken,
    AuthController.verifyEmailOrRenderReset);

router.get('/phone_verification',
    AuthController.sendPhoneCode);

router.get('/verify_phone',
    AuthController.verifyPhone);

router.post('/:role/login',
    AuthValidator.validateLogin,
    AuthController.login);

router.post('/:role/resend',
    validator('email_only'),
    validate,
    AuthValidator.validateEmailVerification,
    AuthController.emailVerificationOrResetPassword);

router.post('/driver/verify_email',
    AuthValidator.userAuth,
    validator('verify_email'),
    validate,
    AuthValidator.validateEmailOtpVerification,
    AuthController.verifyEmail);

router.post('/:role/forgot_password',
    validator('email_only'),
    validate,
    AuthValidator.validateEmailVerification,
    AuthController.emailVerificationOrResetPassword);

router.get('/reset_password/:role/:token',
    AuthValidator.validateParamToken,
    AuthController.verifyEmailOrRenderReset);

router.post('/reset_password/:role/:token',
    validator('password_only'),
    validate,
    AuthValidator.validateParamToken,
    AuthController.resetPassword);

export default router;
