import jwt from 'jsonwebtoken';

import { clients } from './index';
/**
 * @class
 * @description A helper class for sockets
 * @exports Helper
 */
export default class Helper {
    /**
     * @method emitByID
     * @description
     * @static
     * @param {string} id
     * @param {string} event
     * @param {object} payload
     * @returns {object} JSON response
     * @memberof AuthHandler
     */
    static emitByID(id, event, payload) {
        if (!clients[id]) return;
        return clients[id].emit(event, payload);
    }

    /**
     * @method decodeToken
     * @description
     * @static
     * @param {string} token
     * @returns {object} JSON response
     * @memberof Helper
     */
    static decodeToken(token) {
        return jwt.verify(token, process.env.SECRET);
    }
}
