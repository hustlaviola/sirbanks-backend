/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable import/no-cycle */
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import fetch from 'node-fetch';

import {
    clients, reqStatus, pendingRequests, allTripRequests
} from './index';
// import TripRequest from '../models/TripRequest';
// import Trip from '../models/Trip';
import { RIDE_REQUEST, TIMEOUT, NO_DRIVER_FOUND } from './events';

const { GOOGLE_MAPS_API_KEY } = process.env;

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
     * @method getDurationAndDistance
     * @description
     * @static
     * @param {string} obj
     * @returns {object} JSON response
     * @memberof Helper
     */
    static getDurationAndDistance(obj) {
        const { distance } = obj;
        const duration = obj.duration_in_traffic;
        const details = {
            duration: duration.text,
            distance: distance.text
        };
        console.log(`DURATION N DISTANCE ===== ${details}`);
        return details;
    }

    /**
     * @method getEstimatedFare
     * @description
     * @static
     * @param {string} obj
     * @returns {object} JSON response
     * @memberof Helper
     */
    static getEstimatedFare(obj) {
        const { distance } = obj;
        const duration = obj.duration_in_traffic;
        const durationCost = duration.value / 6;
        const distanceCost = distance.value / 20;
        const fare = durationCost + distanceCost + 400;
        let higherEstimate = fare / 20 + fare;
        let lowerEstimate = fare - fare / 20;
        higherEstimate = Math.ceil(Math.ceil(higherEstimate) / 100) * 100;
        lowerEstimate = Math.ceil(Math.ceil(lowerEstimate) / 100) * 100;
        const estimatedFare = {
            lowerEstimate,
            higherEstimate
        };
        console.log(`ESTIMATED FARE ===== ${estimatedFare}`);
        return estimatedFare;
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
            id, pickUp, dropOff, paymentMethod, pickUpLon, pickUpLat,
            dropOffLon, dropOffLat, riderName
        } = data;
        if (!drivers.length) {
            return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
        }
        const driver = drivers.shift();
        const driverLon = driver.location.coordinates[0];
        const driverLat = driver.location.coordinates[1];
        let result = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${pickUpLat},${pickUpLon}&destinations=${driverLat},${driverLon}&key=${GOOGLE_MAPS_API_KEY}`);
        result = await result.json();
        console.log('result ========================', result);
        // let originArea = null;
        let durationToRider = null;
        let distanceToRider = null;
        if (result.status === 'OK') {
            // originArea = result.origin_addresses[0].split(', ');
            // originArea = `${originArea[originArea.length - 3]},
            // ${originArea[originArea.length - 2]}`;
            const response = result.rows[0].elements[0];
            distanceToRider = response.distance.text;
            durationToRider = response.duration_in_traffic.text;
        }
        const tripRequest = {
            tripId: uuid(),
            riderId: id,
            riderName,
            distanceToRider,
            durationToRider,
            // originArea,
            driverId: driver._id,
            pickUp,
            pickUpLon,
            pickUpLat,
            dropOff,
            dropOffLon,
            dropOffLat,
            paymentMethod
        };
        console.log('tripRequest ========================', tripRequest);
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
