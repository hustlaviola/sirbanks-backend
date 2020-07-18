import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import AdminMiddleware from '../middlewares/Admin';
import AdminController from '../controllers/Admin';

const router = express.Router();

router.post('/onboarding',
    AuthValidator.userAuth,
    validator('admin_onboading'),
    validate,
    AdminMiddleware.validateAdminOnboarding,
    AdminController.onboardAdmin);

router.post('/login',
    validator('admin_login'),
    validate,
    AdminMiddleware.validateAdminLogin,
    AdminController.adminLogin);

export default router;
