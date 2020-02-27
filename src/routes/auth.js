import express from 'express';

import AuthValidator from '../middlewares/Auth';
import AuthController from '../controllers/Auth';

const router = express.Router();

router.get('/email-verification/:token',
    AuthValidator.validateParamToken,
    AuthController.verifyEmailOrRenderReset);

router.get('/phone-verification',
    AuthController.sendPhoneCode);

router.get('/verify-phone',
    AuthController.verifyPhone);

export default router;
