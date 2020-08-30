import express from 'express';

import PaymentMiddleware from '../middlewares/Payment';
import PaymentController from '../controllers/Payment';

const router = express.Router();

router.post('/confirmation',
    PaymentMiddleware.confirmPayment,
    PaymentController.confirmPayment);

router.post('/initialize',
    PaymentMiddleware.initiatePayment);

export default router;
