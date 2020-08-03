/* eslint-disable import/no-cycle */
import debug from 'debug';
import validator from 'validator';
import {
    ERROR,
    SUCCESS
} from '../events';
import Driver from '../../models/Driver';
import Rider from '../../models/Rider';
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
     * @method conn
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} token - Response object
     * @returns {object} JSON response
     * @memberof Auth
     */
    static async conn(socket, token) {
        try {
            if (!token) {
                log('token is required');
                socket.emit(ERROR, 'token is required');
                return socket.disconnect();
            }
            token = token.replace('Bearer ', '');
            if (!validator.isJWT(token)) {
                log('Invalid token');
                socket.emit(ERROR, 'Invalid token');
                return socket.disconnect();
            }
            const { id, role } = await Helper.decodeToken(token);
            if (!id || !role) {
                log('Invalid token');
                socket.emit(ERROR, 'Invalid token');
                return socket.disconnect();
            }
            if (!validator.isMongoId(id)) {
                log('Invalid id');
                socket.emit(ERROR, 'Invalid id');
                return socket.disconnect();
            }
            const validRoles = ['rider', 'driver'];
            if (!validRoles.includes(role)) {
                log('Invalid role');
                socket.emit(ERROR, 'Invalid role');
                return socket.disconnect();
            }
            if (
                Object.prototype.hasOwnProperty.call(clients, id) && clients[id].id !== socket.id
            ) {
                clients[id].disconnect();
            }
            socket.jid = id;
            socket.isDriver = false;
            let user;
            if (role === 'driver') {
                user = await Driver.findById(id);
                if (!user) {
                    socket.emit(ERROR, 'User not found');
                    return socket.disconnect();
                }
                socket.isDriver = true;
                user.isOnline = true;
                await user.save();
            } else {
                user = await Rider.findById(id);
                if (!user) {
                    socket.emit(ERROR, 'User not found');
                    return socket.disconnect();
                }
                socket.user = {
                    firstName: user.firstName,
                    avatar: user.avatar
                };
            }
            clients[id] = socket;
            return Helper.emitByID(id, SUCCESS, 'Authenticated successfully');
        } catch (error) {
            log(error);
        }
    }

    // /**
    //  * @method authenticate
    //  * @description
    //  * @static
    //  * @param {object} socket - Request object
    //  * @param {object} token - Response object
    //  * @returns {object} JSON response
    //  * @memberof Auth
    //  */
    // static async authenticate(socket, { token }) {
    //     try {
    //         if (!token) {
    //             log('token is required');
    //             socket.emit(ERROR, 'token is required');
    //             return socket.disconnect();
    //         }
    //         token = token.replace('Bearer ', '');
    //         if (!validator.isJWT(token)) {
    //             log('Invalid token');
    //             socket.emit(ERROR, 'Invalid token');
    //             return socket.disconnect();
    //         }
    //         const { id, role } = await Helper.decodeToken(token);
    //         if (!id || !role) {
    //             log('Invalid token');
    //             socket.emit(ERROR, 'Invalid token');
    //             return socket.disconnect();
    //         }
    //         if (!validator.isMongoId(id)) {
    //             log('Invalid id');
    //             socket.emit(ERROR, 'Invalid id');
    //             return socket.disconnect();
    //         }
    //         const validRoles = ['rider', 'driver'];
    //         if (!validRoles.includes(role)) {
    //             log('Invalid role');
    //             socket.emit(ERROR, 'Invalid role');
    //             return socket.disconnect();
    //         }
    //         if (
    //             Object.prototype.hasOwnProperty.call(clients, id) && clients[id].id !== socket.id
    //         ) {
    //             clients[id].disconnect();
    //         }
    //         socket.jid = id;
    //         socket.isDriver = false;
    //         let user;
    //         if (role === 'driver') {
    //             user = await Driver.findById(id);
    //             if (!user) return socket.emit(ERROR, 'User not found');
    //             socket.isDriver = true;
    //             user.isOnline = true;
    //             await user.save();
    //         } else {
    //             user = await Rider.findById(id);
    //             if (!user) return socket.emit(ERROR, 'User not found');
    //         }
    //         clients[id] = socket;
    //         return Helper.emitByID(id, SUCCESS, 'Authenticated successfully');
    //     } catch (error) {
    //         log(error);
    //     }
    // }

    // /**
    //  * @method authenticate
    //  * @description
    //  * @static
    //  * @param {object} socket - Request object
    //  * @param {object} data - Response object
    //  * @returns {object} JSON response
    //  * @memberof Auth
    //  */
    // static async authenticate(socket, data) {
    //     try {
    //         const { id, role, token } = data;
    //         if (!id || !role || !token) {
    //             return socket.emit(ERROR, 'id/role/token is required');
    //         }
    //         if (!validator.isMongoId(id)) {
    //             return socket.emit(ERROR, 'Invalid id');
    //         }
    //         const validRoles = ['rider', 'driver'];
    //         if (!validRoles.includes(role)) {
    //             return socket.emit(ERROR, 'Invalid role');
    //         }
    //         let user = await Helper.decodeToken(token);
    //         if (!user || user.id !== id) {
    //             return socket.emit(ERROR, 'Authentication failed');
    //         }
    //         if (Object.prototype.hasOwnProperty.call(clients, id)
    //          && clients[id].id !== socket.id) {
    //             clients[id].disconnect();
    //         }
    //         socket.jid = id;
    //         socket.isDriver = false;
    //         if (role === 'driver') {
    //             user = await Driver.findById(id);
    //             if (!user) return socket.emit(ERROR, 'User not found');
    //             socket.isDriver = true;
    //             user.isOnline = true;
    //             await user.save();
    //             user = user.toJSON();
    //             const {
    //                 firstName, email, avatar, vehicleDetails
    //             } = user;
    //             socket.userInfo = {
    //                 firstName, email, avatar, vehicleDetails
    //             };
    //         } else {
    //             user = await Rider.findById(id);
    //             if (!user) return socket.emit(ERROR, 'User not found');
    //             socket.userInfo = {
    //                 email: user.email, firstName: user.firstName
    //             };
    //         }
    //         clients[id] = socket;
    //         return Helper.emitByID(id, SUCCESS, 'Authenticated successfully');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

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
                    await driver.save();
                }
                delete clients[socket.jid];
                log(`${jid} disconnected`);
            } catch (error) {
                log('Error while disconnecting');
            }
        } else {
            delete clients[socket.jid];
            log('Client Disconnected');
        }
    }
}
