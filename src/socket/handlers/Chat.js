/* eslint-disable import/no-cycle */
import debug from 'debug';
import validator from 'validator';
import {
    ERROR,
    NEW_MESSAGE
} from '../events';
import Chat from '../../models/Chat';
import Helper from '../Helper';

import { clients } from '../index';

const log = debug('app:auth');

/**
 * @class
 * @description A handler class for Authentication
 * @exports Auth
 */
export default class Auth {
    /**
     * @method privateMessage
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof Auth
     */
    static async privateMessage(socket, data) {
        try {
            const {
                id, recipientId
            } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                return socket.emit(ERROR, 'Unauthorized');
            }
            if (!validator.isMongoId(recipientId)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            // const validRoles = ['rider', 'driver'];
            // if (!validRoles.includes(role)) {
            //     log('Invalid role');
            //     socket.emit(ERROR, 'Invalid role');
            //     return socket.disconnect();
            // }
            let { name, message } = data;
            name = name.trim().replace(/  +/g, ' ');
            if (name.length > 100 || name.length < 2) {
                return socket.emit(ERROR, 'Name must be within 2 to 100 characters');
            }
            message = message.trim().replace(/  +/g, ' ');
            const payload = {
                senderId: id, senderName: name, recipientId, message
            };
            await Chat.create(payload);
            const senderName = clients[id].userInfo.firstName;
            payload.senderName = senderName;
            if (!clients[recipientId]) {
                return Helper.emitById(id, ERROR, 'Recipient is offline');
            }
            Helper.emitById(recipientId, NEW_MESSAGE, payload);
            log('Message sent successfully');
        } catch (error) {
            log(error);
        }
    }
}
