import express from 'express';

import AuthValidator from '../middlewares/Auth';
import TransactionMiddleware from '../middlewares/Transaction';
import TransactionController from '../controllers/Transaction';

const router = express.Router();

router.post('/',
    AuthValidator.userAuth,
    TransactionMiddleware.createTransaction,
    TransactionController.createTransaction);

router.post('/confirmation',
    TransactionMiddleware.confirmPayment);

export default router;
