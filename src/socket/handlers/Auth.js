/* eslint-disable import/no-cycle */
import {
    ERROR,
    SUCCESS
} from '../events';
import Driver from '../../models/Driver';
import Rider from '../../models/Rider';
import Helper from '../Helper';

import { clients } from '../index';

/**
 * @class
 * @description A handler class for Authentication
 * @exports Auth
 */
export default class Auth {
    /**
     * @method authenticate
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof AuthHandler
     */
    static async authenticate(socket, data) {
        try {
            const { id, role, token } = data;
            if (!id || !role) {
                return socket.emit(ERROR, `No 'id/role ${data}`);
            }
            let user = await Helper.decodeToken(token);
            if (!user || user.id !== id) {
                return socket.emit(ERROR, 'Authentication failed');
            }
            if (Object.prototype.hasOwnProperty.call(clients, id) && clients[id].id !== socket.id) {
                clients[id].disconnect();
            }
            socket.jid = id;
            socket.isDriver = false;
            if (role === 'driver') {
                user = await Driver.findById(id);
                if (!user) return socket.emit(ERROR, 'User not found');
                socket.isDriver = true;
                user.isOnline = true;
                await user.save();
            } else {
                user = await Rider.findById(id);
                if (!user) return socket.emit(ERROR, 'User not found');
            }
            clients[id] = socket;
            return Helper.emitByID(id, SUCCESS, 'Authenticated successfully');
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * @method disconnectUser
     * @description
     * @static
     * @param {object} socket - Request object
     * @returns {object} JSON response
     * @memberof AuthHandler
     */
    static async disconnectUser(socket) {
        const { jid, isDriver } = socket;
        if (jid && isDriver) {
            try {
                const driver = await Driver.findById(jid);
                if (driver) {
                    driver.isOnline = false;
                    driver.isAvailable = false;
                    await driver.save();
                    delete clients[socket.jid];
                }
                console.log(`${jid} disconnected`);
            } catch (error) {
                console.log('Error while disconnecting');
            }
        } else {
            delete clients[socket.jid];
            console.log('Client Disconnected');
        }
    }
}
