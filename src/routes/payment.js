import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import PaymentMiddleware from '../middlewares/Payment';
import PaymentController from '../controllers/Payment';

const router = express.Router();

router.post('/confirmation',
    PaymentMiddleware.confirmPayment,
    PaymentController.confirmPayment);

router.post('/initialize',
    PaymentMiddleware.initiatePayment);

router.delete('/cards/:cardId/remove',
    AuthValidator.userAuth,
    validator('cardId'),
    validate,
    PaymentMiddleware.removeCard,
    PaymentController.removeCard);

export default router;
