/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
import validator from 'validator';
import debug from 'debug';
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
    ACCEPTED_REQUEST
} from '../events';
import Driver from '../../models/Driver';
import Rider from '../../models/Rider';
import Trip from '../../models/Trip';
// import Rider from '../../models/Rider';
import Helper from '../Helper';
import {
    clients, pendingRequests, reqStatus, allTripRequests
} from '../index';
import TransactionService from '../../services/TransactionService';

const log = debug('app:socket:trip');

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
            log(`location update ============= id: ${id}, role: ${role}, lon: ${lon}, ${lat}`);
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                return socket.emit(ERROR, 'Unauthorized');
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
                        // const compLon = pickUpLocation.coordinates[0];
                        // const compLat = pickUpLocation.coordinates[1];
                        // const distance = getDistance(
                        //     { latitude: compLat, longitude: compLon },
                        //     { latitude: lat, longitude: lon }
                        // );
                        const riderDetails = { riderName: firstName, lon, lat };
                        Helper.emitByID(
                            trip.driverId, RIDER_LOCATION_UPDATED, JSON.stringify(riderDetails)
                        );
                    }
                }
                return rider.save();
            }
            const driver = await Driver.findById(id);
            if (!driver) {
                return Helper.emitByID(id, ERROR, 'Driver not found');
            }
            const location = { type: 'Point', coordinates: [Number(lon), Number(lat)] };
            driver.location = location;
            const validTripStatus = ['accepted', 'transit'];
            const { currentTripId, currentTripStatus } = driver;
            if (currentTripId && validTripStatus.includes(currentTripStatus)) {
                const trip = await Trip.findById(currentTripId);
                if (!trip) {
                    return Helper.emitByID(id, ERROR, 'Trip not found');
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
                        driverName: firstName, avatar, lon, lat, vehicleDetails
                    };
                    Helper.emitByID(
                        trip.riderId, DRIVER_LOCATION_UPDATED, JSON.stringify(driverDetails)
                    );
                }
                await driver.save();
            } else {
                await driver.save();
            }
            return log('Location updated Successfully');
            // socket.emit(SUCCESS, 'Location updated Successfully');
        } catch (error) {
            log(error);
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
                return socket.emit(ERROR, 'Unauthorized');
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
                id, pickUpLon, pickUpLat, dropOffLon, dropOffLat
            } = data;
            log(`request ride ============= id: ${id}, pickUpLon: ${pickUpLon}, pickUpLat: ${pickUpLat}, dropOffLon: ${dropOffLon}, dropOffLat ${dropOffLat}`);
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                return socket.emit(ERROR, 'Unauthorized');
            }
            if (!validator.isLatLong(`${pickUpLat}, ${pickUpLon}`)) {
                return socket.emit(ERROR, 'Invalid pickUp coordinates(lat/lon)');
            }
            if (!validator.isLatLong(`${dropOffLat}, ${dropOffLon}`)) {
                return socket.emit(ERROR, 'Invalid dropOff coordinates(lat/lon)');
            }
            let { pickUp, dropOff, paymentMethod } = data;
            paymentMethod = paymentMethod.toLowerCase();
            const validPaymentMethods = ['cash', 'card', 'wallet'];
            if (!validPaymentMethods.includes(paymentMethod)) {
                return socket.emit(ERROR, 'Invalid paymentMethod');
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
                        spherical: true
                    }
                },
                {
                    $match: {
                        isAvailable: true,
                        isOnline: true,
                        currentTripStatus: 'none'
                    }
                }
            ]);
            log('drivers: =====', drivers);
            if (!drivers.length) {
                return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
            }
            return Helper.dispatch(data, drivers, 20);
        } catch (error) {
            log(error);
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
                return socket.emit(ERROR, 'Unauthorized');
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            if (!pendingRequests[tripId] || !reqStatus[tripId] || !allTripRequests[tripId]) {
                return socket.emit(ERROR, 'The trip request you accepted was not found');
            }
            if (!validator.isLatLong(`${lat}, ${lon}`)) {
                return socket.emit(ERROR, 'Invalid driver coordinates(lat/lon)');
            }
            const {
                riderId, pickUp, dropOff, paymentMethod, pickUpLon,
                pickUpLat, dropOffLon, dropOffLat
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
                paymentMethod
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
            await driver.save();
            await rider.save();

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
                pickUp,
                pickUpLon,
                pickUpLat,
                dropOff,
                dropOffLon,
                dropOffLat,
                paymentMethod: trip.paymentMethod,
                driverDetails
            };
            const newDriverTrip = {
                tripId: trip._id,
                riderName: rider.firstName,
                pickUp,
                pickUpLon,
                pickUpLat,
                dropOff,
                dropOffLon,
                dropOffLat,
                paymentMethod: trip.paymentMethod
            };
            Helper.emitByID(riderId, DRIVER_FOUND, JSON.stringify(newRiderTrip));
            log('Request accepted');
            delete allTripRequests[tripId];
            return Helper.emitByID(id, ACCEPTED_REQUEST, JSON.stringify(newDriverTrip));
        } catch (error) {
            log(error);
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
                return socket.emit(ERROR, 'Unauthorized');
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
            return Helper.dispatch(reqInfo, drivers, 20);
        } catch (error) {
            log(error);
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
                return socket.emit(ERROR, 'Unauthorized');
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
                return socket.emit(ERROR, 'Unauthorized');
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
                return socket.emit(ERROR, 'Unauthorized');
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
            const findTasks = [
                Trip.findOne({ tripId }),
                Driver.findById(id)
            ];
            const values = await Promise.all(findTasks);
            const trip = values[0];
            const driver = values[1];
            if (!trip) {
                return Helper.emitById(id, ERROR, 'The trip you tried to cancel was not found');
            }
            if (trip.status !== 'accepted') {
                return Helper.emitById(id, ERROR, 'Trip cannot be cancelled');
            }
            if (!driver) {
                return Helper.emitById(id, ERROR, 'Driver not found');
            }
            if (isDriver && trip.driverId !== id) {
                return Helper.emitById(
                    id, ERROR, 'The trip you tried to start wasn\'t assigned to you'
                );
            }
            trip.status = 'canceled';
            driver.currentTripStatus = 'none';
            driver.currentTripId = null;
            const saveTasks = [trip.save(), driver.save()];
            await Promise.all(saveTasks);
            Helper.emitById(id, SUCCESS, 'Trip successfully canceled');
            log('Trip successfully canceled');
            // Emit to rider if trip was canceled by a driver
            if (isDriver) {
                return Helper.emitById(
                    trip.riderId, TRIP_CANCELED, 'Trip canceled by driver, book another ride'
                );
            }
            // The rider canceled the trip so emit to driver
            return Helper.emitById(trip.driverId, TRIP_CANCELED, 'Trip canceled by rider');
        } catch (error) {
            log(error);
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
                id, tripId, distance, dropOffLat, dropOffLon
            } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                return socket.emit(ERROR, 'Unauthorized');
            }
            if (!validator.isUUID(tripId)) {
                return socket.emit(ERROR, 'Invalid tripId');
            }
            if (typeof distance !== 'number') {
                return socket.emit(ERROR, 'Invalid distance');
            }
            let { dropOff } = data;
            dropOff = validator.escape(dropOff.trim().replace(/  +/g, ' '));
            const findTasks = [
                Trip.findOne({ tripId }),
                Driver.findById(id)
            ];
            const values = await Promise.all(findTasks);
            const trip = values[0];
            const driver = values[1];
            const { driverId, riderId } = trip;

            if (!trip) {
                return Helper.emitById(id, ERROR, 'The trip you tried to cancel was not found');
            }
            if (!driver) {
                return Helper.emitById(id, ERROR, 'Driver not found');
            }
            if (driverId !== id) {
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
            const distanceCost = (distance / 1000) * 50;
            const total = baseFare + durationCost + distanceCost;

            const tripInfo = {
                baseFare,
                duration,
                distance,
                durationCost,
                distanceCost,
                total
            };

            trip.status = 'ended';
            trip.endTime = endTime;
            trip.duration = duration;
            trip.dropOff = dropOff;
            trip.dropOffLocation = {
                type: 'Point', coordinates: [Number(dropOffLon), Number(dropOffLat)]
            };
            trip.fare = total;
            driver.currentTripStatus = 'none';
            driver.currentTripId = null;
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
            if (trip.paymentMethod === 'wallet') {
                const rider = await Rider.findById(riderId);
                if (!rider) {
                    return Helper.emitById(id, ERROR, 'Rider not found');
                }
                rider.balance -= total;
                driver.balance += driverIncome;
                await rider.save();
            }
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
