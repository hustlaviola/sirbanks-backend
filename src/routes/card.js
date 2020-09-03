import express from 'express';

import AuthValidator from '../middlewares/Auth';
import validator from '../utils/validationSchema';
import validate from '../middlewares/validate';
import CardMiddleware from '../middlewares/Card';
import CardController from '../controllers/Card';

const router = express.Router();

router.get('/',
    AuthValidator.userAuth,
    CardMiddleware.getCards,
    CardController.getCards);

router.get('/:cardId/set_default',
    AuthValidator.userAuth,
    validator('cardId'),
    validate,
    CardMiddleware.setDefaultCard,
    CardController.setDefaultCard);

router.get('/cc/:cardId',
    CardMiddleware.getCCard);

router.delete('/:cardId',
    AuthValidator.userAuth,
    validator('cardId'),
    validate,
    CardMiddleware.removeCard,
    CardController.removeCard);

export default router;
