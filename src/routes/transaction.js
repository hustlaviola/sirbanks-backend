import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import TransactionMiddleware from '../middlewares/Transaction';
import TransactionController from '../controllers/Transaction';

const router = express.Router();

router.post('/',
    AuthValidator.userAuth,
    validator('add_transaction'),
    validate,
    TransactionMiddleware.createTransaction,
    TransactionController.createTransaction);

export default router;
