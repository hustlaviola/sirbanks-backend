/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable import/no-cycle */
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import {
    clients, reqStatus, pendingRequests, allTripRequests
} from './index';
// import TripRequest from '../models/TripRequest';
// import Trip from '../models/Trip';
import { RIDE_REQUEST, TIMEOUT, NO_DRIVER_FOUND } from './events';

/**
 * @class
 * @description A helper class for sockets
 * @exports Helper
 */
export default class Helper {
    /**
     * @method emitByID
     * @description
     * @static
     * @param {string} id
     * @param {string} event
     * @param {object} payload
     * @returns {object} JSON response
     * @memberof Helper
     */
    static emitByID(id, event, payload) {
        if (!clients[id]) return;
        return clients[id].emit(event, payload);
    }

    /**
     * @method auth
     * @description
     * @static
     * @param {string} id
     * @returns {object} JSON response
     * @memberof Helper
     */
    static auth(id) {
        if (clients[id]) return true;
        return false;
    }

    /**
     * @method decodeToken
     * @description
     * @static
     * @param {string} token
     * @returns {object} JSON response
     * @memberof Helper
     */
    static decodeToken(token) {
        return jwt.verify(token, process.env.SECRET);
    }

    /**
     * @method dispatch
     * @description
     * @static
     * @param {object} data
     * @param {object} drivers
     * @param {object} quantum
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async dispatch(data, drivers, quantum) {
        const {
            id, pickUp, dropOff, paymentMethod, pickUpLon,
            pickUpLat, dropOffLon, dropOffLat, firstName, avatar
        } = data;
        if (!drivers.length) {
            return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
        }
        const driver = drivers.shift();
        const tripRequest = {
            tripId: uuid(),
            riderId: id,
            firstName,
            avatar,
            driverId: driver._id,
            pickUp,
            pickUpLon,
            pickUpLat,
            dropOff,
            dropOffLon,
            dropOffLat,
            paymentMethod
        };
        reqStatus[tripRequest.tripId] = {
            reqInfo: data,
            drivers
        };
        allTripRequests[tripRequest.tripId] = tripRequest;
        if (clients[driver._id]) {
            clients[driver._id].emit(RIDE_REQUEST, JSON.stringify(tripRequest));
            console.log(`Sent request to: ${driver.firstName} id: ${driver._id}`);
            pendingRequests[tripRequest.tripId] = setInterval(() => {
                quantum--;
                console.log(quantum);
                if (quantum < 1) {
                    clearInterval(pendingRequests[tripRequest.tripId]);
                    delete pendingRequests[tripRequest.tripId];
                    if (clients[driver._id]) {
                        clients[driver._id].emit(TIMEOUT, 'You didn\'t respond to this request');
                    }
                    delete reqStatus[tripRequest.tripId];
                    delete allTripRequests[tripRequest.tripId];
                    return Helper.dispatch(data, drivers, 15);
                }
            }, 1000);
        } else {
            delete reqStatus[tripRequest.tripId];
            delete allTripRequests[tripRequest.tripId];
            return Helper.dispatch(data, drivers, 15);
        }
    }
}
