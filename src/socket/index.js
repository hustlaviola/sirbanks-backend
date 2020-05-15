/* eslint-disable import/no-cycle */
/* eslint-disable no-plusplus */
import SocketIO from 'socket.io';
import AuthHandler from './handlers/Auth';
import TripHandler from './handlers/Trip';
import {
    UPDATE_LOCATION,
    UPDATE_AVAILABILITY,
    REQUEST_RIDE,
    REQUEST_ACCEPTED,
    REQUEST_REJECTED
} from './events';

export const clients = {};
export const reqStatus = {};
export const pendingRequests = {};
export const allTripRequests = {};

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
            const { token } = socket.handshake.query;
            AuthHandler.conn(socket, token);
            console.log(`${connectCounter} client(s) connected`);
            // socket.on(AUTH, data => AuthHandler.authenticate(socket, data));

            socket.on(UPDATE_LOCATION, data => TripHandler.updateLocation(socket, data));

            socket.on(UPDATE_AVAILABILITY, data => TripHandler.updateAvail(socket, data));

            socket.on(REQUEST_RIDE, data => TripHandler.requestRide(socket, data));

            socket.on(REQUEST_ACCEPTED, data => TripHandler.requestAccepted(socket, data));

            socket.on(REQUEST_REJECTED, data => TripHandler.requestRejected(data));

            socket.on('disconnect', () => {
                connectCounter--;
                console.log(`${connectCounter} client(s) connected`);
                AuthHandler.disconnectUser(socket);
            });
        });
    }
}
