import Card from '../models/Card';
import Helper from '../utils/helpers/Helper';

/**
 * @class
 * @description
 * @exports CardService
 */export default class CardService {
    /**
     * @method addCard
     * @description
     * @static
     * @param {object} card
     * @returns {object} JSON response
     * @memberof CardService
     */
    static async addCard(card) {
        return Card.create(card);
    }

    /**
     * @method getCard
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof CardService
     */
    static async getCard(id) {
        return Card.findById(id);
    }

    /**
     * @method getAllDisplayableCards
     * @description
     * @static
     * @param {object} user
     * @returns {object} JSON response
     * @memberof CardService
     */
    static async getAllDisplayableCards(user) {
        let cards = Card.find({ user }).select(['id', 'brand', 'type', 'suffix']);
        cards = cards.map(card => ({
            id: card.id,
            brand: card.brand,
            type: card.type,
            suffix: card.suffix
        }));
        return cards;
    }

    /**
     * @method getChargeableCardById
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof CardService
     */
    static async getChargeableCardById(id) {
        const card = await Card.findById(id).select(['encrypted', 'email']);
        if (!card) return null;
        const { encrypted, email } = card;
        const authCode = await Helper.decrypt(encrypted);
        return { authCode, email };
    }

    /**
     * @method getDisplayableCardById
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof CardService
     */
    static async getDisplayableCardById(id) {
        const card = await Card.findById(id).select(['brand', 'type', 'suffix']);
        if (!card) return null;
        const { brand, type, suffix } = card;
        return {
            id, brand, type, suffix
        };
    }

    /**
     * @method getChargeableCardByUser
     * @description
     * @static
     * @param {object} user
     * @returns {object} JSON response
     * @memberof CardService
     */
    static async getChargeableCardByUser(user) {
        const card = await Card.findOne({ user }).select(['encrypted', 'email']);
        if (!card) return null;
        const { encrypted, email } = card;
        const authCode = Helper.decrypt(encrypted);
        return { authCode, email };
    }
}
