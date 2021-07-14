import express from 'express';

import PaymentMiddleware from '../middlewares/Payment';
import PaymentController from '../controllers/Payment';
import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';

const router = express.Router();

router.get('/cards/addition',
    AuthValidator.userAuth,
    PaymentMiddleware.initiateAddCard,
    PaymentController.initiateAddCard);

router.get('/wallet/funding',
    AuthValidator.userAuth,
    validator('fund_wallet'),
    validate,
    PaymentMiddleware.initiateFundWallet,
    PaymentController.initiateFundWallet);

router.get('/completion',
    AuthValidator.userAuth,
    validator('complete_payment'),
    validate,
    PaymentMiddleware.completePayment,
    PaymentController.completePayment);

router.post('/confirmation',
    PaymentMiddleware.confirmPayment,
    PaymentController.confirmPayment);

router.post('/initialize',
    PaymentMiddleware.initiatePayment);

router.get('/charge',
    PaymentMiddleware.chargeCard);

export default router;
