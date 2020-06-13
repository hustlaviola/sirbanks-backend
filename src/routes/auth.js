import express from 'express';

import AuthValidator from '../middlewares/Auth';
import AuthController from '../controllers/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';

const router = express.Router();

router.post('/:role/email_login',
    validator('email_login'),
    validate,
    AuthValidator.validateLogin,
    AuthController.login);

router.post('/:role/phone_login',
    validator('phone_login'),
    validate,
    AuthValidator.validateLogin,
    AuthController.login);

router.post('/resend_email_verification',
    validator('email_only'),
    validate,
    AuthValidator.validateEmailLink,
    AuthController.sendEmailLink);

router.post('/forgot_password',
    validator('email_only'),
    validate,
    AuthValidator.validateEmailLink,
    AuthController.sendEmailLink);

export default router;
