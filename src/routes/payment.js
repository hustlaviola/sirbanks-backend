import express from 'express';

import PaymentMiddleware from '../middlewares/Payment';
import PaymentController from '../controllers/Payment';
import AuthValidator from '../middlewares/Auth';

const router = express.Router();

router.get('/cards/addition',
    AuthValidator.userAuth,
    PaymentMiddleware.initiateAddCard,
    PaymentController.initiateAddCard);

router.post('/confirmation',
    PaymentMiddleware.confirmPayment,
    PaymentController.confirmPayment);

router.post('/initialize',
    PaymentMiddleware.initiatePayment);

router.get('/charge',
    PaymentMiddleware.chargeCard);

export default router;
