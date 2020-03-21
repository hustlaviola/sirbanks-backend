/* eslint-disable import/no-cycle */
/* eslint-disable no-plusplus */
import util from 'util';
import SocketIO from 'socket.io';
import AuthHandler from './handlers/Auth';
import TripHandler from './handlers/Trip';
import Helper from './Helper';
import {
    AUTH,
    UPDATE_LOCATION,
    UPDATE_AVAILABILITY,
    REQUEST_RIDE,
    REQUEST_ACCEPTED,
    REQUEST_DENIED,
    SUCCESS
} from './events';

export const clients = {};
export const reqStatus = {};
export const pendingRequests = {};
export const dispatchP = util.promisify(Helper.dispatch);
export const sendTripRequestP = util.promisify(Helper.sendTripRequest);

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
            socket.on(AUTH, data => AuthHandler.authenticate(socket, data));

            socket.on(
                UPDATE_LOCATION, data => TripHandler.updateLocation(socket, data)
            );

            socket.on(
                UPDATE_AVAILABILITY, data => TripHandler.updateAvail(socket, data)
            );

            socket.on(
                REQUEST_RIDE, data => TripHandler.requestRide(data)
            );

            socket.on(REQUEST_ACCEPTED, data => {
                reqStatus[data.tripId] = data;
                clearInterval(pendingRequests[data.tripId]);
                return TripHandler.requestAccepted(socket, data);
            });

            socket.on(
                REQUEST_DENIED, data => {
                    socket.emit(SUCCESS, 'you succesfully rejected the request');
                    reqStatus[data.tripId] = undefined;
                    clearInterval(pendingRequests[data.tripId]);
                    data.id = data.riderId;
                    delete data.riderId;
                    return TripHandler.requestRide(data);
                }
            );

            socket.on('disconnect', () => {
                connectCounter--;
                console.log(`${connectCounter} client(s) connected`);
                AuthHandler.disconnectUser(socket);
            });
        });
    }
}
