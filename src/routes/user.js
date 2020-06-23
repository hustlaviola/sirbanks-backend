import express from 'express';

import AuthValidator from '../middlewares/Auth';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';

const router = express.Router();

router.get('/trips',
    AuthValidator.userAuth,
    UserValidator.validateGetUserTrips,
    UserController.getUserTrips);

router.patch('/upload_avatar',
    AuthValidator.userAuth,
    UserValidator.validateAvatarUpload,
    UserController.uploadAvatar);

export default router;
