import httpStatus from 'http-status';

import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';
import CardService from '../services/CardService';

const log = debug('app:onboarding-middleware');

/**
 * @class
 * @description
 * @exports Card
 */
export default class Card {
    /**
     * @method getCCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Card
     */
    static async getCCard(req, res, next) {
        try {
            const card = await CardService.getChargeableCardById('5f50cf2fb684c2001ef76e98');
            res.send(card);
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method getCards
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Card
     */
    static async getCards(req, res, next) {
        try {
            const cards = await CardService.getAllDisplayableCards(req.user.id);
            req.cards = cards;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method setDefaultCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Card
     */
    static async setDefaultCard(req, res, next) {
        try {
            const card = await CardService.getCard(req.params.cardId);
            if (!card) {
                return next(new APIError(
                    'Card not found', httpStatus.NOT_FOUND, true
                ));
            }
            if (card.user.toString() !== req.user.id.toString()) {
                return next(new APIError(
                    messages.unauthorized, httpStatus.UNAUTHORIZED, true
                ));
            }
            card.default = true;
            const defaultCard = await CardService.getDefaultCard(req.user.id);
            if (defaultCard) {
                defaultCard.default = false;
                await defaultCard.save();
            }
            await card.save();
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method removeCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Card
     */
    static async removeCard(req, res, next) {
        try {
            const card = await CardService.getCard(req.params.cardId);
            if (!card) {
                return next(new APIError(
                    'Card not found', httpStatus.NOT_FOUND, true
                ));
            }
            if (card.user.toString() !== req.user.id.toString()) {
                return next(new APIError(
                    messages.unauthorized, httpStatus.UNAUTHORIZED, true
                ));
            }
            await card.remove();
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
