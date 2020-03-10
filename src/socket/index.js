/* eslint-disable import/no-cycle */
/* eslint-disable no-plusplus */
import SocketIO from 'socket.io';
import AuthHandler from './handlers/Auth';
import TripHandler from './handlers/Trip';
import {
    AUTH,
    UPDATE_LOCATION,
    UPDATE_AVAILABILITY
} from './events';

export const clients = {};

/**
 * @class
 * @description A controller class for Authentication routes
 * @exports AuthController
 */
export default class SocketServer {
    /**
     * @method createServer
     * @description
     * @static
     * @param {object} server - Request object
     * @returns {object} JSON response
     * @memberof SocketServer
     */
    static createServer(server) {
        const io = SocketIO.listen(server);

        let connectCounter = 0;

        io.sockets.on('connection', socket => {
            connectCounter++;
            console.log(`${connectCounter} client(s) connected`);

            socket.on(AUTH, data => AuthHandler.authenticate(socket, JSON.parse(data)));

            socket.on(
                UPDATE_LOCATION, data => TripHandler.updateLocation(socket, JSON.parse(data))
            );

            socket.on(
                UPDATE_AVAILABILITY, data => TripHandler.updateAvail(socket, JSON.parse(data))
            );

            socket.on('disconnect', () => {
                connectCounter--;
                console.log(`${connectCounter} client(s) connected`);
                AuthHandler.disconnectUser(socket);
            });
        });
    }
}
