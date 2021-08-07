/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
import validator from 'validator';
import fetch from 'node-fetch';
import request from 'request';

import paystack from '../../config/paystack';
// import { getDistance } from 'geolib';
import {
    ERROR,
    SUCCESS,
    NO_DRIVER_FOUND,
    DRIVER_FOUND,
    DRIVER_LOCATION_UPDATED,
    RIDER_LOCATION_UPDATED,
    TRIP_STARTED,
    DESTINATION_UPDATED,
    TRIP_CANCELED,
    TRIP_ENDED,
    REQUEST_ACCEPTED,
    TRIP_DETAILS
} from '../events';
import Driver from '../../models/Driver';
import Rider from '../../models/Rider';
import Trip from '../../models/Trip';
// import Rider from '../../models/Rider';
import Helper from '../Helper';
import HelperUtil from '../../utils/helpers/Helper';
import {
    clients, pendingRequests, reqStatus, allTripRequests
} from '../index';
import TransactionService from '../../services/TransactionService';
import { debug } from '../../config/logger';
import CardService from '../../services/CardService';

const { chargeAuth } = paystack(request);

const log = debug('app:socket:trip');

const { GOOGLE_MAPS_API_KEY } = process.env;

/**
 * @class
 * @description A handler class for Authentication
 * @exports TripHandler
 */
export default class TripHandler {
    /**
     * @method updateLocation
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async updateLocation(socket, data) {
        try {
            const {
                id, role, lon, lat
            } = data;
            let riderDeviceId;
            log(`location update ============= id: ${id}, role: ${role}, lon: ${lon}, ${lat}`);
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isLatLong(`${lat}, ${lon}`)) {
                return socket.emit(ERROR, 'Invalid coordinates(lat or lon)');
            }
            const validRoles = ['rider', 'driver'];
            if (!validRoles.includes(role)) {
                log('Invalid role');
                socket.emit(ERROR, 'Invalid role');
                return socket.disconnect();
            }
            let isDriver = false;
            if (role === 'driver') isDriver = true;
            if (!isDriver) {
                const rider = await Rider.findById(id);
                if (!rider) {
                    return Helper.emitByID(id, ERROR, 'Rider not found');
                }
                riderDeviceId = rider.device.token;
                const location = { type: 'Point', coordinates: [Number(lon), Number(lat)] };
                rider.location = location;
                const { firstName, currentTripId, currentTripStatus } = rider;
                if (currentTripId && currentTripStatus === 'accepted') {
                    const trip = await Trip.findById(currentTripId);
                    if (!trip) {
                        return Helper.emitByID(id, ERROR, 'Trip not found');
                    }
                    const { driverId } = trip;
                    if (clients[driverId]) {
                        const driver = await Driver.findById(trip.driverId);
                        const [compLon, compLat] = driver.location.coordinates;
                        let tripResult = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${lat},${lon}&destinations=${compLat},${compLon}&key=${GOOGLE_MAPS_API_KEY}`);
                        log('tripResult', tripResult);
                        tripResult = await tripResult.json();
                        let duration;
                        let distance;
                        if (tripResult.status === 'OK') {
                            const tripResponse = tripResult.rows[0].elements[0];
                            const durationDistance = await Helper
                                .getDurationAndDistance(tripResponse);
                            duration = durationDistance.duration;
                            distance = durationDistance.distance;
                        }
                        const riderDetails = {
                            id, riderName: firstName, lon, lat, distance, duration
                        };
                        log(`Rider Details ${JSON.stringify(riderDetails)}`);
                        Helper.emitByID(
                            trip.driverId, RIDER_LOCATION_UPDATED, JSON.stringify(riderDetails)
                        );
                    }
                    trip.pickUpLocation = { type: 'Point', coordinates: [Number(lon), Number(lat)] };
                    await trip.save();
                }
                return rider.save();
            }
            const driver = await Driver.findById(id);
            if (!driver) {
                return Helper.emitByID(id, ERROR, 'Driver not found');
            }
            const driverDeviceId = driver.device.token;
            const location = { type: 'Point', coordinates: [Number(lon), Number(lat)] };
            driver.location = location;
            const validTripStatus = ['accepted', 'transit'];
            const { currentTripId, currentTripStatus } = driver;
            if (currentTripId && validTripStatus.includes(currentTripStatus)) {
                const trip = await Trip.findById(currentTripId);
                if (!trip) {
                    return Helper.emitByID(id, ERROR, 'Trip not found');
                }
                let compLon;
                let compLat;
                const { pickUpLocation, dropOffLocation } = trip;
                if (currentTripStatus === 'accepted') {
                    [compLon, compLat] = pickUpLocation.coordinates;
                } else {
                    [compLon, compLat] = dropOffLocation.coordinates;
                }
                let tripResult = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${lat},${lon}&destinations=${compLat},${compLon}&key=${GOOGLE_MAPS_API_KEY}`);
                tripResult = await tripResult.json();
                let duration;
                let distance;
                let distanceValue;
                if (tripResult.status === 'OK') {
                    const tripResponse = tripResult.rows[0].elements[0];
                    const durationDistance = await Helper.getDurationAndDistance(tripResponse);
                    duration = durationDistance.duration;
                    distance = durationDistance.distance;
                    distanceValue = durationDistance.distanceVal;
                }
                if (clients[trip.riderId]) {
                    const { firstName, avatar } = driver;
                    let { vehicleDetails } = driver;
                    vehicleDetails = {
                        make: vehicleDetails.make,
                        model: vehicleDetails.model,
                        year: vehicleDetails.year,
                        color: vehicleDetails.color,
                        numberPlate: vehicleDetails.numberPlate
                    };
                    // const { pickUpLocation, dropOffLocation } = trip;
                    // const compLon = currentTripStatus === 'accepted'
                    //     ? pickUpLocation.coordinates[0] : dropOffLocation.coordinates[0];
                    // const compLat = currentTripStatus === 'accepted'
                    //     ? pickUpLocation.coordinates[1] : dropOffLocation.coordinates[1];
                    // const distance = getDistance(
                    //     { latitude: compLat, longitude: compLon },
                    //     { latitude: lat, longitude: lon }
                    // );
                    // log(distance);
                    // let status = '';
                    // if (distance <= 200) {
                    //     status = 'Arrived';
                    // } else if (distance <= 600) {
                    //     status = 'Arriving';
                    // } else if (currentTripStatus === 'accepted') {
                    //     status = 'Enroute';
                    // }
                    const driverDetails = {
                        id,
                        driverName: firstName,
                        avatar,
                        lon,
                        lat,
                        distance,
                        duration,
                        vehicleDetails
                    };
                    log(`Driver Details ${JSON.stringify(driverDetails)}`);
                    Helper.emitByID(
                        trip.riderId, DRIVER_LOCATION_UPDATED, JSON.stringify(driverDetails)
                    );
                    if (currentTripStatus === 'accepted' && distanceValue <= 100) {
                        if (distanceValue <= 100) {
                            await HelperUtil.sendPNToDevice(riderDeviceId, 'ARRIVED', 'Driver has reached your location');
                            await HelperUtil.sendPNToDevice(driverDeviceId, 'ARRIVED', 'You are at the rider\'s location');
                        }
                    } else if (distanceValue <= 100) {
                        await HelperUtil.sendPNToDevice(riderDeviceId, 'ARRIVED', 'You have reached your destination');
                        await HelperUtil.sendPNToDevice(driverDeviceId, 'ARRIVED', 'You have reached the destination');
                    }
                }
                await driver.save();
            } else {
                await driver.save();
            }
            return log('Location updated Successfully');
            // socket.emit(SUCCESS, 'Location updated Successfully');
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method updateAvail
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async updateAvail(socket, data) {
        try {
            const { id, availability } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (typeof availability !== 'boolean') {
                return socket.emit(ERROR, 'Invalid availability');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            // let isAvailable = false;
            // if (availability === 'available') isAvailable = true;
            const driver = await Driver.findById(id);
            if (!driver) {
                return Helper.emitByID(id, ERROR, 'User not found');
            }
            driver.isAvailable = availability;
            await driver.save();
            log(`You are now ${availability ? 'available' : 'unavailable'}`);
            return Helper.emitByID(id, SUCCESS, `You are now ${availability ? 'available' : 'unavailable'}`);
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method getTripDetails
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async getTripDetails(socket, data) {
        try {
            const {
                id, pickUpLat, pickUpLon, dropOffLat, dropOffLon
            } = data;
            log(`get trip details ======== 
                id: ${id},
                pickUpLon: ${pickUpLon},
                pickUpLat: ${pickUpLat},
                dropOffLon: ${dropOffLon},
                dropOffLat ${dropOffLat}`);
            if (!id || !pickUpLat || !pickUpLon || !dropOffLat || !dropOffLon) {
                return socket.emit(ERROR, 'Missing required fields');
            }
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isLatLong(`${pickUpLat}, ${pickUpLon}`)) {
                return socket.emit(ERROR, 'Invalid pickUp coordinates(lat/lon)');
            }
            if (!validator.isLatLong(`${dropOffLat}, ${dropOffLon}`)) {
                return socket.emit(ERROR, 'Invalid dropOff coordinates(lat/lon)');
            }
            const drivers = await Driver.aggregate([
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [Number(pickUpLon), Number(pickUpLat)] },
                        distanceField: 'dist.calculated',
                        maxDistance: 1000000,
                        includeLocs: 'dist.location',
                        spherical: true
                    }
                },
                {
                    $match: {
                        isAvailable: true,
                        isOnline: true,
                        currentTripStatus: null
                    }
                }
            ]);
            log('drivers', drivers);
            // if (!drivers.length) {
            //     return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
            // }
            let tripResult = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${pickUpLat},${pickUpLon}&destinations=${dropOffLat},${dropOffLon}&key=${GOOGLE_MAPS_API_KEY}`);
            log('tripResult', tripResult);
            tripResult = await tripResult.json();
            const tripDetails = {};
            if (tripResult.status === 'OK') {
                const tripResponse = tripResult.rows[0].elements[0];
                const tripDurationDistance = await Helper.getDurationAndDistance(tripResponse);
                tripDetails.duration = tripDurationDistance.duration;
                tripDetails.distance = tripDurationDistance.distance;
                const estimatedFare = await Helper.getEstimatedFare(tripResponse);
                tripDetails.estimatedFare = estimatedFare;
            }
            if (drivers.length) {
                const driverLon = drivers[0].location.coordinates[0];
                const driverLat = drivers[0].location.coordinates[1];
                let driverResult = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${pickUpLat},${pickUpLon}&destinations=${driverLat},${driverLon}&key=${GOOGLE_MAPS_API_KEY}`);
                log('driverResult', driverResult);
                driverResult = await driverResult.json();
                if (driverResult.status === 'OK') {
                    const driverResponse = driverResult.rows[0].elements[0];
                    const driverDurationDistance = await Helper.getDurationAndDistance(
                        driverResponse
                    );
                    tripDetails.durationToRider = driverDurationDistance.duration;
                    tripDetails.distanceToRider = driverDurationDistance.distance;
                }
                const driversCoords = drivers.map(driver => ({
                    lon: driver.location.coordinates[0],
                    lat: driver.location.coordinates[1]
                }));
                tripDetails.drivers = driversCoords;
            }
            log(`THE TRIP DETAILS ====== ${JSON.stringify(tripDetails)}`);
            return socket.emit(TRIP_DETAILS, JSON.stringify(tripDetails));
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method requestRide
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async requestRide(socket, data) {
        try {
            const {
                id, pickUpLat, pickUpLon, dropOffLat, dropOffLon, payment
            } = data;
            log('DATA ===========', data);
            log('DATA ========', JSON.stringify(data));
            log(`request ride ============= id: ${id}, pickUpLon: ${pickUpLon}, pickUpLat: ${pickUpLat}, dropOffLon: ${dropOffLon}, dropOffLat ${dropOffLat}`);
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isLatLong(`${pickUpLat}, ${pickUpLon}`)) {
                return socket.emit(ERROR, 'Invalid pickUp coordinates(lat/lon)');
            }
            if (!validator.isLatLong(`${dropOffLat}, ${dropOffLon}`)) {
                return socket.emit(ERROR, 'Invalid dropOff coordinates(lat/lon)');
            }
            let { pickUp, dropOff } = data;
            if (!payment || !payment.method) {
                return socket.emit(ERROR, 'payment method is required');
            }
            const paymentMethod = payment.method.toLowerCase();
            const validPaymentMethods = ['cash', 'card', 'wallet'];
            if (!validPaymentMethods.includes(paymentMethod)) {
                return socket.emit(ERROR, 'Invalid paymentMethod');
            }
            if (paymentMethod === 'card') {
                if (!payment.cardId) {
                    return socket.emit(ERROR, 'cardId is required for this payment method');
                }
                if (!validator.isMongoId(payment.cardId)) {
                    return socket.emit(ERROR, 'Invalid cardId');
                }
            }
            if (!pickUp || !dropOff) {
                return socket.emit(ERROR, 'pickUp/dropOff is required');
            }
            pickUp = pickUp.trim().replace(/  +/g, ' ');
            dropOff = dropOff.trim().replace(/  +/g, ' ');
            data.pickUp = pickUp;
            data.dropOff = dropOff;
            log('Searching for drivers');
            const drivers = await Driver.aggregate([
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [Number(pickUpLon), Number(pickUpLat)] },
                        distanceField: 'dist.calculated',
                        maxDistance: 1000000,
                        includeLocs: 'dist.location',
                        spherical: true
                    }
                },
                {
                    $match: {
                        isAvailable: true,
                        isOnline: true,
                        currentTripStatus: null
                    }
                }
            ]);
            log(drivers[0]);
            log(drivers[0].dist.location);
            if (!drivers.length) {
                return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
            }
            // const result = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${pickUpLat},${pickUpLon}&destinations=${dropOffLat},${dropOffLon}&key=${GOOGLE_MAPS_API_KEY}`);
            // let originArea;
            // let duration;
            // let distance;
            // let estimatedFare;
            // if (result.status === 'OK') {
            //     originArea = result.origin_addresses[0].split(', ');
            //     originArea = `${originArea[originArea.length - 3]},
            //     ${originArea[originArea.length - 2]}`;
            //     const response = result.rows[0].elements[0];
            //     distance = response.distance;
            //     duration = response.duration_in_traffic;
            //     const durationCost = duration.value / 6;
            //     const distanceCost = distance.value / 20;
            //     const fare = durationCost + distanceCost + 400;
            //     let higherEstimate = fare / 20 + fare;
            //     let lowerEstimate = fare - fare / 20;
            //     higherEstimate = Math.ceil(Math.ceil(higherEstimate) / 100) * 100;
            //     lowerEstimate = Math.ceil(Math.ceil(lowerEstimate) / 100) * 100;
            //     estimatedFare = {
            //         lowerEstimate,
            //         higherEstimate
            //     };
            // }

            data.riderName = socket.user.firstName;
            // data.distance = distance ? distance.text : null;
            // data.duration = duration ? duration.text : null;
            // data.estimatedFare = estimatedFare || null;
            return Helper.dispatch(data, drivers, 60);
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method requestAccepted
     * @description
     * @static
     * @param {object} socket
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async requestAccepted(socket, data) {
        try {
            const {
                id, lon, lat, tripId
            } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            log(`pending ===== ${JSON.stringify(pendingRequests)} reqStatus ===== ${JSON.stringify(reqStatus)} allTripRequests ======${allTripRequests} `);
            log(`pending ===== ${pendingRequests[tripId]} reqStatus ===== ${reqStatus[tripId]} allTripRequests ======${allTripRequests[tripId]} nothing ${allTripRequests.heee}`);
            log(!pendingRequests[tripId] || !reqStatus[tripId] || !allTripRequests[tripId]);
            if (!pendingRequests[tripId] || !reqStatus[tripId] || !allTripRequests[tripId]) {
                return socket.emit(ERROR, 'The trip request you accepted was not found');
            }
            if (!validator.isLatLong(`${lat}, ${lon}`)) {
                return socket.emit(ERROR, 'Invalid driver coordinates(lat/lon)');
            }
            const {
                riderId, pickUp, dropOff, payment, pickUpLon,
                pickUpLat, dropOffLon, dropOffLat, distanceToRider, durationToRider
            } = allTripRequests[tripId];
            clearInterval(pendingRequests[tripId]);
            delete pendingRequests[tripId];
            delete reqStatus[tripId];
            const pickUpLocation = { coordinates: [Number(pickUpLon), Number(pickUpLat)] };
            const dropOffLocation = { coordinates: [Number(dropOffLon), Number(dropOffLat)] };
            let trip = {
                riderId,
                driverId: id,
                pickUp,
                pickUpLocation,
                dropOff,
                dropOffLocation,
                status: 'accepted',
                payment
            };
            const driver = await Driver.findById(id);
            const rider = await Rider.findById(riderId);
            // const values = await Promise.all([Driver.findById(id), Rider.findById(id)]);
            // const driver = values[0];
            // const rider = values[1];
            if (!driver) return socket.emit(ERROR, 'Driver not found');
            if (!rider) return socket.emit(ERROR, 'Rider does not exists');
            trip = await Trip.create(trip);
            driver.currentTripStatus = 'accepted';
            driver.currentTripId = trip._id;
            rider.currentTripStatus = 'accepted';
            rider.currentTripId = trip._id;
            let result = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${pickUpLat},${pickUpLon}&destinations=${dropOffLat},${dropOffLon}&key=${GOOGLE_MAPS_API_KEY}`);
            result = await result.json();
            let duration;
            let distance;
            let estimatedFare;
            if (result.status === 'OK') {
                const response = result.rows[0].elements[0];
                distance = response.distance;
                duration = response.duration_in_traffic;
                const durationCost = duration.value / 6;
                const distanceCost = distance.value / 20;
                const fare = durationCost + distanceCost + 400;
                let higherEstimate = fare / 20 + fare;
                let lowerEstimate = fare - fare / 20;
                higherEstimate = Math.ceil(Math.ceil(higherEstimate) / 100) * 100;
                lowerEstimate = Math.ceil(Math.ceil(lowerEstimate) / 100) * 100;
                estimatedFare = {
                    lowerEstimate,
                    higherEstimate
                };
            }

            // If the rider is still online
            const { firstName, avatar, phone } = driver;
            let { vehicleDetails } = driver;
            vehicleDetails = {
                make: vehicleDetails.make,
                model: vehicleDetails.model,
                year: vehicleDetails.year,
                color: vehicleDetails.color,
                numberPlate: vehicleDetails.numberPlate
            };
            // const distance = getDistance(
            //     { latitude: pickUpLat, longitude: pickUpLon },
            //     { latitude: lat, longitude: lon }
            // );
            const driverDetails = {
                driverName: firstName, phone, avatar, lon, lat, vehicleDetails
            };
            const newRiderTrip = {
                tripId: trip._id,
                driverId: id,
                pickUp,
                pickUpLon,
                pickUpLat,
                dropOff,
                dropOffLon,
                dropOffLat,
                distance: distance ? distance.text : null,
                duration: duration ? duration.text : null,
                estimatedFare: estimatedFare || null,
                distanceToRider,
                durationToRider,
                paymentMethod: trip.payment.method,
                driverDetails
            };
            const newDriverTrip = {
                tripId: trip._id,
                riderName: rider.firstName,
                riderId,
                pickUp,
                pickUpLon,
                pickUpLat,
                dropOff,
                dropOffLon,
                dropOffLat,
                distance: distance ? distance.text : null,
                duration: duration ? duration.text : null,
                estimatedFare: estimatedFare || null,
                distanceToRider,
                durationToRider
            };
            await driver.save();
            await rider.save();
            Helper.emitByID(riderId, DRIVER_FOUND, JSON.stringify(newRiderTrip));
            log('Request accepted');
            delete allTripRequests[tripId];
            return socket.emit(REQUEST_ACCEPTED, JSON.stringify(newDriverTrip));
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method requestRejected
     * @description
     * @static
     * @param {object} socket
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async requestRejected(socket, data) {
        try {
            const { id, tripId } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            if (!pendingRequests[tripId] || !reqStatus[tripId] || !allTripRequests[tripId]) {
                return socket.emit(ERROR, 'The trip request you rejected was not found');
            }
            clearInterval(pendingRequests[tripId]);
            delete pendingRequests[tripId];
            const reqObj = { ...reqStatus[tripId] };
            delete reqStatus[tripId];
            delete allTripRequests[tripId];
            const { reqInfo, drivers } = reqObj;
            Helper.emitByID(id, SUCCESS, 'You have successfully rejected the request');
            return Helper.dispatch(reqInfo, drivers, 60);
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method startTrip
     * @description
     * @static
     * @param {object} socket
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async startTrip(socket, data) {
        try {
            const { id, tripId } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            const findTasks = [
                Trip.findOne({ tripId }),
                Driver.findById(id)
            ];
            const values = await Promise.all(findTasks);
            const trip = values[0];
            const driver = values[1];
            if (!trip) {
                return Helper.emitById(id, ERROR, 'The trip you tried to start was not found');
            }
            if (!driver) {
                return Helper.emitById(id, ERROR, 'Driver not found');
            }
            if (trip.driverId !== id) {
                return Helper.emitById(
                    id, ERROR, 'The trip you tried to start wasn\'t assigned to you'
                );
            }
            const rider = await Rider.findById(trip.riderId);
            if (!rider) {
                return Helper.emitById(id, ERROR, 'Driver not found');
            }
            const startTime = new Date();
            trip.startTime = startTime;
            trip.status = 'transit';
            driver.currentTripStatus = 'transit';
            rider.currentTripStatus = 'transit';
            await rider.save();
            const saveTasks = [trip.save(), driver.save()];
            await Promise.all(saveTasks);
            const driverDetails = {
                driverName: driver.firstName,
                avatar: driver.avatar,
                lon: driver.location.coordinates[0],
                lat: driver.location.coordinates[1],
                vehicleDetails: driver.vehicleDetails
            };
            const theTrip = {
                tripId,
                driverId: trip.driverId,
                pickUp: trip.pickUp,
                pickUpLon: trip.pickUpLocation.coordinates[0],
                pickUpLat: trip.pickUpLocation.coordinates[1],
                dropOff: trip.dropOff,
                dropOffLon: trip.dropOffLocation.coordinates[0],
                dropOffLat: trip.dropOffLocation.coordinates[1],
                driverDetails
            };
            Helper.emitById(id, SUCCESS, 'Trip started successfully');
            log('Trip successfully started');
            return Helper.emitById(trip.riderId, TRIP_STARTED, JSON.stringify(theTrip));
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method updateDestination
     * @description
     * @static
     * @param {object} socket
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async updateDestination(socket, data) {
        try {
            const {
                id, tripId, dropOffLon, dropOffLat
            } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            if (!validator.isLatLong(`${dropOffLat}, ${dropOffLon}`)) {
                return socket.emit(ERROR, 'Invalid dropOff coordinates(lat/lon)');
            }
            // const validRoles = ['rider', 'driver'];
            // if (!validRoles.includes(role)) {
            //     log('Invalid role');
            //     socket.emit(ERROR, 'Invalid role');
            //     return socket.disconnect();
            // }
            let { dropOff } = data;
            dropOff = validator.escape(dropOff.trim().replace(/  +/g, ' '));
            // let isDriver = false;
            // if (role === 'driver') isDriver = true;
            const trip = await Trip.findOne({ tripId });
            if (!trip) return Helper.emitById(id, ERROR, 'Trip being updated was not found');
            // const tripJSON = trip.toJSON();
            // const start_time = tripJSON.status === 'started' ? tripJSON.start_time : new Date();
            trip.dropOff = dropOff;
            trip.dropOffLocation = {
                type: 'Point', coordinates: [Number(dropOffLon), Number(dropOffLat)]
            };
            await trip.save();
            const drop = {
                tripId, dropOff, dropOffLon, dropOffLat
            };
            Helper.emitByJid(id, SUCCESS, 'Destination updated');
            log('Destination updated');
            // if (isDriver) {
            //     return Helper.emitById(trip.riderId, DESTINATION_UPDATED, JSON.stringify(drop));
            // }
            return Helper.emitById(trip.driverId, DESTINATION_UPDATED, JSON.stringify(drop));
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method cancelTrip
     * @description
     * @static
     * @param {object} socket
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async cancelTrip(socket, data) {
        try {
            const { id, role, tripId } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            const validRoles = ['rider', 'driver'];
            if (!validRoles.includes(role)) {
                log('Invalid role');
                socket.emit(ERROR, 'Invalid role');
                return socket.disconnect();
            }
            let isDriver = false;
            if (role === 'driver') isDriver = true;
            const trip = Trip.findOne({ tripId });
            if (!trip) {
                return Helper.emitById(id, ERROR, 'The trip you tried to cancel was not found');
            }
            if (trip.status !== 'accepted') {
                return Helper.emitById(id, ERROR, 'Trip cannot be cancelled');
            }
            const findTasks = [
                Rider.findById(trip.riderId),
                Driver.findById(trip.driverId)
            ];
            const values = await Promise.all(findTasks);
            const rider = values[0];
            const driver = values[1];
            if (!driver) {
                return Helper.emitById(id, ERROR, 'Driver not found');
            }
            if (!rider) {
                return Helper.emitById(id, ERROR, 'Rider not found');
            }
            if (isDriver && trip.driverId.toString() !== id.toString()) {
                return Helper.emitById(
                    id, ERROR, 'The trip you tried to start wasn\'t assigned to you'
                );
            }
            trip.status = 'canceled';
            await trip.save();
            driver.currentTripStatus = null;
            driver.currentTripId = null;
            rider.currentTripStatus = null;
            rider.currentTripId = null;
            const saveTasks = [rider.save(), driver.save()];
            await Promise.all(saveTasks);
            log('Trip successfully canceled');
            // Emit to rider if trip was canceled by a driver
            if (isDriver) {
                Helper.emitById(id, SUCCESS, 'Trip successfully canceled');
                return Helper.emitById(
                    trip.riderId, TRIP_CANCELED, 'Trip canceled by driver, book another ride'
                );
            }
            Helper.emitById(id, SUCCESS, 'Trip successfully canceled');
            // The rider canceled the trip so emit to driver
            return Helper.emitById(trip.driverId, TRIP_CANCELED, 'Trip canceled by rider');
        } catch (error) {
            log(error);
            socket.emit(ERROR, 'An error occurred');
        }
    }

    /**
     * @method endTrip
     * @description
     * @static
     * @param {object} socket
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async endTrip(socket, data) {
        try {
            const {
                id, tripId, dropOffLat, dropOffLon
            } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                socket.emit(ERROR, 'Unauthorized');
                return socket.disconnect();
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            let { dropOff } = data;
            dropOff = validator.escape(dropOff.trim().replace(/  +/g, ' '));
            const trip = await Trip.findOne({ tripId });
            const { driverId, riderId } = trip;
            const findTasks = [
                Rider.findById(riderId),
                Driver.findById(id)
            ];
            const values = await Promise.all(findTasks);
            const rider = values[0];
            const driver = values[1];

            if (!trip) {
                return Helper.emitById(id, ERROR, 'The trip you tried to end was not found');
            }
            if (!rider) {
                return Helper.emitById(id, ERROR, 'Rider not found');
            }
            if (!driver) {
                return Helper.emitById(id, ERROR, 'Driver not found');
            }
            if (driverId.toString() !== id.toString()) {
                return Helper.emitById(
                    id, ERROR, 'The trip you tried to end wasn\'t assigned to you'
                );
            }

            const endTime = new Date();
            const { startTime } = trip;
            const baseFare = 400;
            const duration = Math.round((endTime - startTime) / 60000);
            log(duration);
            const durationCost = duration * 10;
            let tripResult = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&departure_time=now&origins=${trip.pickUpLocation[1]},${trip.pickUpLocation[0]}&destinations=${dropOffLat},${dropOffLon}&key=${GOOGLE_MAPS_API_KEY}`);
            tripResult = await tripResult.json();
            log('TRIP RESULT', tripResult);
            let distance = 0;
            let distanceCost = 0;
            if (tripResult.status === 'OK') {
                const tripResponse = tripResult.rows[0].elements[0];
                const tripDurationDistance = await Helper.getDurationAndDistance(tripResponse);
                distance = tripDurationDistance.distanceVal;
                distanceCost = (distance / 1000) * 50;
                log('DISTANCE VAL ==== ', distance);
                log('DISTANCE TEXT ==== ', tripDurationDistance.distance);
                log('APP DURATION', duration);
                log('GOOGLE DURATION', tripDurationDistance.duration);
            }
            const total = baseFare + durationCost + distanceCost;

            const tripInfo = {
                baseFare,
                duration,
                distance,
                durationCost,
                distanceCost,
                total
            };

            log('TRIP INFO ====', tripInfo);

            trip.status = 'ended';
            trip.endTime = endTime;
            trip.duration = duration;
            trip.dropOff = dropOff;
            trip.dropOffLocation = {
                type: 'Point', coordinates: [Number(dropOffLon), Number(dropOffLat)]
            };
            trip.fare = total;
            driver.currentTripStatus = null;
            driver.currentTripId = null;
            rider.currentTripStatus = null;
            rider.currentTripId = null;
            const driverIncome = 0.75 * total;
            const riderTransaction = {
                user: riderId,
                amount: total,
                transactionType: 'debit',
                narration: 'Payment for trip taken'
            };
            const driverTransaction = {
                user: driverId,
                amount: driverIncome,
                transactionType: 'credit',
                narration: 'Income for trip taken'
            };
            if (trip.payment.method === 'wallet') rider.balance -= total;
            else if (trip.payment.method === 'card') {
                const card = await CardService.getChargeableCardById(trip.payment.cardId);
                if (!card) {
                    // TODO: Log settlement issue
                }
                const form = {
                    authorization_code: card.authCode,
                    email: card.email,
                    amount: total
                };
                chargeAuth(form, async (err, body) => {
                    if (err) {
                        log(err);
                        // TODO: Log settlement issue
                    } else {
                        log(body);
                        // TODO: Save transaction
                    }
                });
            }
            // TODO Payment
            await rider.save();
            driver.balance += driverIncome;
            await Promise.all([trip.save(), driver.save()]);
            await Promise.all([
                TransactionService.createTransaction(riderTransaction),
                TransactionService.createTransaction(driverTransaction)
            ]);
            log(tripInfo);
            // Emit Trip details to driver
            Helper.emitById(id, TRIP_ENDED, JSON.stringify(tripInfo));
            // Emit trip details to rider
            return Helper.emitByJid(riderId, TRIP_ENDED, JSON.stringify(tripInfo));
        } catch (error) {
            log(error);
            return socket.emit(ERROR, 'An error occurred while ending trip');
        }
    }
}
