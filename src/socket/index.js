/* eslint-disable import/no-cycle */
/* eslint-disable no-plusplus */
import SocketIO from 'socket.io';
import debug from 'debug';
import AuthHandler from './handlers/Auth';
import TripHandler from './handlers/Trip';
import ChatHandler from './handlers/Chat';
import {
    // AUTH,
    UPDATE_LOCATION,
    UPDATE_AVAILABILITY,
    REQUEST_RIDE,
    ACCEPT_REQUEST,
    REJECT_REQUEST,
    PRIVATE_MESSAGE,
    CANCEL_TRIP,
    UPDATE_DESTINATION,
    GET_TRIP_DETAILS,
    START_TRIP,
    END_TRIP
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
        const io = SocketIO.listen(server, {
            // pingInterval: 86400000,
            // pingTimeout: 43200000,
            cookie: false
        });

        let connectCounter = 0;

        io.sockets.on('connection', socket => {
            connectCounter++;
            socket.emit('CON', 'Connection successful');
            const { authorization } = socket.handshake.query;
            log(`Authorization ${authorization}`);
            log(`${connectCounter} client(s) connected`);
            AuthHandler.conn(socket, authorization);
            // socket.on(AUTH, data => AuthHandler.authenticate(socket, data));

            socket.on(UPDATE_LOCATION, data => TripHandler.updateLocation(socket, data));

            socket.on(UPDATE_AVAILABILITY, data => TripHandler.updateAvail(socket, data));

            socket.on(GET_TRIP_DETAILS, data => TripHandler.getTripDetails(socket, data));

            socket.on(REQUEST_RIDE, data => TripHandler.requestRide(socket, data));

            socket.on(ACCEPT_REQUEST, data => TripHandler.requestAccepted(socket, data));

            socket.on(REJECT_REQUEST, data => TripHandler.requestRejected(socket, data));

            socket.on(CANCEL_TRIP, data => TripHandler.cancelTrip(socket, data));

            socket.on(START_TRIP, data => TripHandler.startTrip(socket, data));

            socket.on(END_TRIP, data => TripHandler.endTrip(socket, data));

            socket.on(UPDATE_DESTINATION, data => TripHandler.updateDestination(socket, data));

            socket.on(PRIVATE_MESSAGE, data => ChatHandler.privateMessage(socket, data));

            socket.on('disconnect', () => {
                connectCounter--;
                log(`${connectCounter} client(s) connected`);
                AuthHandler.disconnectUser(socket);
            });
        });
    }
}
