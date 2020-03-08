/* eslint-disable no-plusplus */
import SocketIO from 'socket.io';

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

            socket.on('disconnect', () => {
                connectCounter--;
                console.log(`${connectCounter} client(s) connected`);
            });
        });
    }
}
