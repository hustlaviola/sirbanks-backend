/* eslint-disable no-plusplus */
import SocketIO from 'socket.io';
// eslint-disable-next-line import/no-cycle
import Auth from './handlers/Auth';
import { AUTH } from './events';

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

            socket.on(AUTH, data => Auth.authenticate(socket, JSON.parse(data)));

            socket.on('disconnect', () => {
                connectCounter--;
                console.log(`${connectCounter} client(s) connected`);
                Auth.disconnectUser(socket);
            });
        });
    }
}
