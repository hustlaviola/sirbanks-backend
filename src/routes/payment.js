import express from 'express';
import PaymentMiddleware from '../middlewares/Payment';

const router = express.Router();

router.post('/initialize',
    PaymentMiddleware.initiatePayment);

router.post('/confirmation',
    PaymentMiddleware.confirmPayment);

export default router;
