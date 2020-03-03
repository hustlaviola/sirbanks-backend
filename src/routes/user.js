import express from 'express';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import UserValidator from '../middlewares/User';
import UserController from '../controllers/User';

const router = express.Router();

router.post('/:role',
    validator('register'),
    validate,
    UserValidator.validateUserReg,
    UserController.register);

export default router;
