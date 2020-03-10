/* eslint-disable no-plusplus */
/* eslint-disable import/no-cycle */
import jwt from 'jsonwebtoken';

import {
    clients, sendTripRequestP, reqStatus, pendingRequests, dispatchP
} from './index';
import TripRequest from '../models/TripRequest';
import { RIDE_REQUEST, TIMEOUT, ERROR } from './events';

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
     * @memberof AuthHandler
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
     * @memberof AuthHandler
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
     * @param {object} callback
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async dispatch(data, drivers, callback) {
        if (drivers.length < 1) {
            return callback(null, false);
        }
        await sendTripRequestP(data, drivers, 10);
        // log('===============', trip_id);
        // log(reqStatus[trip_id]);
        // if (reqStatus[trip_id] != null) {
        //     return callback(null, reqStatus[trip_id]);
        // }
        drivers.shift();
        return dispatchP(data, drivers, callback);
    }

    /**
     * @method sendTripRequest
     * @description
     * @static
     * @param {object} payload
     * @param {object} drivers
     * @param {number} quantum
     * @param {object} callback
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async sendTripRequest(payload, drivers, quantum, callback) {
        try {
            const driver = drivers[0];
            const tripRequest = await Helper.createTripRequest(payload, driver);
            reqStatus[tripRequest.id] = null;
            const newDrivers = [...drivers];
            newDrivers.shift();
            tripRequest.newDrivers = newDrivers;
            if (clients[driver.id]) {
                clients[driver.id].emit(RIDE_REQUEST, JSON.stringify(tripRequest));
            }
            console.log(`Sent request to: ${driver.name} id: ${driver.id}`);
            pendingRequests[tripRequest.id] = setInterval(() => {
                quantum--;
                console.log(quantum);
                if (quantum < 1) {
                    clearInterval(pendingRequests[tripRequest.id]);
                    if (clients[driver.id]) {
                        clients[driver.id].emit(TIMEOUT, 'You didn\'t respond to this request');
                    }
                    reqStatus[tripRequest.id] = null;
                    return callback(null, tripRequest.id);
                }
            }, 1000);
        } catch (error) {
            console.log(error);
            if (clients[payload.id]) {
                return clients[payload.id].emit(ERROR, 'Error while creating trip request');
            }
            return false;
        }
    }

    /**
     * @method createTripRequest
     * @description
     * @static
     * @param {object} payload
     * @param {object} driver
     * @returns {object} JSON response
     * @memberof Helper
     */
    static async createTripRequest(payload, driver) {
        const {
            id, pickUp, pickUpLat, pickuPLon, dropOff, dropOffLat, dropOffLon, paymentMethod
        } = payload;
        const pickUpLocation = {
            coordinates: [Number(pickuPLon), Number(pickUpLat)]
        };
        const dropOffLocation = {
            coordinates: [Number(dropOffLon), Number(dropOffLat)]
        };
        const request = {
            riderId: id,
            driverId: driver.id,
            pickUp,
            pickUpLocation,
            dropOff,
            dropOffLocation,
            status: 'pending',
            paymentMethod
        };
        const tripRequest = await TripRequest.create(request);
        return tripRequest.toJSON();
    }
}
