/* eslint-disable import/no-cycle */
/* eslint-disable no-plusplus */
import SocketIO from 'socket.io';
import debug from 'debug';
import AuthHandler from './handlers/Auth';
import TripHandler from './handlers/Trip';
import ChatHandler from './handlers/Chat';
import {
    AUTH,
    UPDATE_LOCATION,
    UPDATE_AVAILABILITY,
    REQUEST_RIDE,
    REQUEST_ACCEPTED,
    REQUEST_REJECTED,
    PRIVATE_MESSAGE
} from './events';

export const clients = {};
export const reqStatus = {};
export const pendingRequests = {};
export const allTripRequests = {};

const log = debug('app:index');

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
            socket.emit('CON', 'Connection successful');
            const { token } = socket.handshake.query;
            log(`${connectCounter} client(s) connected`);
            AuthHandler.conn(socket, token);
            socket.on(AUTH, data => AuthHandler.authenticate(socket, data));

            socket.on(UPDATE_LOCATION, data => TripHandler.updateLocation(socket, data));

            socket.on(UPDATE_AVAILABILITY, data => TripHandler.updateAvail(socket, data));

            socket.on(REQUEST_RIDE, data => TripHandler.requestRide(socket, data));

            socket.on(REQUEST_ACCEPTED, data => TripHandler.requestAccepted(socket, data));

            socket.on(REQUEST_REJECTED, data => TripHandler.requestRejected(socket, data));

            socket.on(PRIVATE_MESSAGE, data => ChatHandler.privateMessage(socket, data));

            socket.on('disconnect', () => {
                connectCounter--;
                log(`${connectCounter} client(s) connected`);
                AuthHandler.disconnectUser(socket);
            });
        });
    }
}
