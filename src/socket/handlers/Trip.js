/* eslint-disable import/no-cycle */
import validator from 'validator';
import { getDistance } from 'geolib';
import {
    ERROR,
    SUCCESS,
    NO_DRIVER_FOUND,
    DRIVER_FOUND,
    DRIVER_LOCATION_UPDATED,
    TRIP_STARTED,
    DESTINATION_UPDATED,
    TRIP_CANCELED,
    TRIP_ENDED
} from '../events';
import Driver from '../../models/Driver';
import Rider from '../../models/Rider';
import Trip from '../../models/Trip';
// import Rider from '../../models/Rider';
import Helper from '../Helper';
import {
    clients, pendingRequests, reqStatus, allTripRequests
} from '../index';

// import { clients } from '../index';

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
                id, lon, lat
            } = data;
            if (!validator.isMongoId(id)) {
                return socket.emit(ERROR, 'Invalid id');
            }
            if (!Helper.auth(id)) {
                return socket.emit(ERROR, 'Unauthorized');
            }
            if (!validator.isLatLong(`${lat}, ${lon}`)) {
                return socket.emit(ERROR, 'Invalid coordinates(lat or lon)');
            }
            // const { firstName, avatar, vehicleDetails } = clients[id].userInfo;
            const driver = await Driver.findById(id);
            if (!driver) {
                return Helper.emitByID(id, ERROR, 'Driver not found');
            }
            const location = { type: 'Point', coordinates: [Number(lon), Number(lat)] };
            driver.location = location;
            const validTripStatus = ['accepted', 'transit'];
            const { currentTripId, currentTripStatus } = driver;
            if (currentTripId && validTripStatus.includes(currentTripStatus)) {
                const trip = await Trip.findOne({ currentTripId });
                if (clients[trip.riderId]) {
                    const {
                        firstName, avatar, vehicleDetails
                    } = driver;
                    const { pickUpLocation, dropOffLocation } = trip;
                    const compLon = currentTripStatus === 'accepted'
                        ? pickUpLocation.coordinates[0] : dropOffLocation.coordinates[0];
                    const compLat = currentTripStatus === 'accepted'
                        ? pickUpLocation.coordinates[1] : dropOffLocation.coordinates[1];
                    const distance = getDistance(
                        { latitude: compLat, longitude: compLon },
                        { latitude: lat, longitude: lon }
                    );
                    console.log(distance);
                    let status = '';
                    if (distance <= 200) {
                        status = 'Arrived';
                    } else if (distance <= 600) {
                        status = 'Arriving';
                    } else if (currentTripStatus === 'accepted') {
                        status = 'Enroute';
                    }
                    const driverDetails = {
                        driverName: firstName, avatar, lon, lat, distance, status, vehicleDetails
                    };
                    Helper.emitByID(
                        trip.riderId, DRIVER_LOCATION_UPDATED, JSON.stringify(driverDetails)
                    );
                }
                await driver.save();
            } else {
                await driver.save();
            }
            return console.log('Location updated Successfully');
            // socket.emit(SUCCESS, 'Location updated Successfully');
        } catch (error) {
            console.log(error);
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
            console.log(`You are now ${availability ? 'available' : 'unavailable'}`);
            return Helper.emitByID(id, SUCCESS, `You are now ${availability ? 'available' : 'unavailable'}`);
        } catch (error) {
            console.log(error);
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
                id, pickUpLon, pickUpLat, dropOffLon, dropOffLat, paymentMethod
            } = data;
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
            const validPaymentMethods = ['cash', 'card', 'wallet'];
            if (!validPaymentMethods.includes(paymentMethod)) {
                return socket.emit(ERROR, 'Invalid paymentMethod');
            }
            let { pickUp, dropOff } = data;
            pickUp = validator.escape(pickUp.trim().replace(/  +/g, ' '));
            dropOff = validator.escape(dropOff.trim().replace(/  +/g, ' '));
            data.pickUp = pickUp;
            data.dropOff = dropOff;
            console.log('Searching for drivers');
            const drivers = await Driver.aggregate([
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [Number(pickUpLon), Number(pickUpLat)] },
                        distanceField: 'dist.calculated',
                        maxDistance: 3000,
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
            if (!drivers.length) {
                return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
            }
            return Helper.dispatch(data, drivers, 10);
        } catch (error) {
            console.log(error);
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
            const driver = await Driver.findById(id);
            if (!driver) return socket.emit(ERROR, 'User not found');
            const pickUpLocation = { coordinates: [Number(pickUpLon), Number(pickUpLat)] };
            const dropOffLocation = { coordinates: [Number(dropOffLon), Number(dropOffLat)] };
            let trip = {
                riderId,
                driverId: id,
                pickUp,
                pickUpLocation,
                dropOff,
                dropOffLocation,
                tripId,
                status: 'accepted',
                paymentMethod
            };
            driver.currentTripStatus = 'accepted';
            driver.currentTripId = tripId;
            await driver.save();
            trip = await Trip.create(trip);

            // If the rider is still online
            const { firstName, avatar } = driver;
            let { vehicleDetails } = driver;
            vehicleDetails = {
                make: vehicleDetails.make,
                model: vehicleDetails.model,
                year: vehicleDetails.year,
                color: vehicleDetails.color,
                numberPlate: vehicleDetails.numberPlate
            };
            const distance = getDistance(
                { latitude: pickUpLat, longitude: pickUpLon },
                { latitude: lat, longitude: lon }
            );
            const driverDetails = {
                driverName: firstName, avatar, lon, lat, distance, vehicleDetails
            };
            const newTrip = {
                tripId,
                riderId,
                driverId: trip.driverId,
                avatar,
                pickUp,
                pickUpLon,
                pickUpLat,
                dropOff,
                dropOffLon,
                dropOffLat,
                distance,
                driverDetails
            };
            Helper.emitByID(riderId, DRIVER_FOUND, JSON.stringify(newTrip));
            console.log('Request accepted');
            delete allTripRequests[tripId];
            return Helper.emitByID(id, SUCCESS, 'You have successfully accepted the request');
        } catch (error) {
            console.log(error);
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
            clearInterval(pendingRequests[tripId]);
            delete pendingRequests[tripId];
            const reqObj = { ...reqStatus[tripId] };
            delete reqStatus[tripId];
            const { reqInfo, drivers } = reqObj;
            Helper.emitByID(id, SUCCESS, 'You have successfully rejected the request');
            return Helper.dispatch(reqInfo, drivers, 10);
        } catch (error) {
            console.log(error);
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
            const startTime = new Date();
            trip.startTime = startTime;
            trip.status = 'transit';
            driver.currentTripStatus = 'transit';
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
            console.log('Trip successfully started');
            return Helper.emitById(trip.riderId, TRIP_STARTED, JSON.stringify(theTrip));
        } catch (error) {
            console.log(error);
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
            let { dropOff } = data;
            dropOff = validator.escape(dropOff.trim().replace(/  +/g, ' '));
            let isDriver = false;
            if (clients[id].isDriver) isDriver = true;
            const trip = await Trip.findOne({ tripId });
            if (!trip) return Helper.emitById(id, ERROR, 'Trip being updated was not found');
            // const tripJSON = trip.toJSON();
            // const start_time = tripJSON.status === 'started' ? tripJSON.start_time : new Date();
            trip.dropOff = dropOff;
            trip.dropOffLocation = {
                type: 'Point', coordinates: [Number(dropOffLon), Number(dropOffLat)]
            };
            await trip.save();
            const drop = { dropOff, dropOffLon, dropOffLat };
            Helper.emitByJid(id, SUCCESS, 'Destination updated');
            console.log('Destination updated');
            if (isDriver) {
                return Helper.emitById(trip.riderId, DESTINATION_UPDATED, JSON.stringify(drop));
            }
            return Helper.emitById(trip.driverId, DESTINATION_UPDATED, JSON.stringify(drop));
        } catch (error) {
            console.log(error);
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
            let isDriver = false;
            if (clients[id].isDriver) isDriver = true;
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
            console.log('Trip successfully canceled');
            // Emit to rider if trip was canceled by a driver
            if (isDriver) {
                return Helper.emitById(
                    trip.riderId, TRIP_CANCELED, 'Trip canceled by driver, book another ride'
                );
            }
            // The rider canceled the trip so emit to driver
            return Helper.emitById(trip.driverId, TRIP_CANCELED, 'Trip canceled by rider');
        } catch (error) {
            console.log(error);
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
            const { id, tripId, distance } = data;
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
            console.log(duration);
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
            trip.fare = total;
            driver.currentTripStatus = 'none';
            driver.currentTripId = null;
            if (trip.paymentMethod === 'wallet') {
                const rider = await Rider.findById(riderId);
                if (!rider) {
                    return Helper.emitById(id, ERROR, 'Rider not found');
                }
                rider.balance -= total;
                driver.balance += 0.75 * total;
                await rider.save();

                // TODO: Credit  the Driver with 75% of the total amount
                // TODO: Store rider transaction on the transactions table
                // TODO: Store driv zer transaction on the transactions table
            }
            const saveTasks = [trip.save(), driver.save()];
            await Promise.all(saveTasks);
            console.log(tripInfo);
            // Emit Trip details to driver
            Helper.emitById(id, TRIP_ENDED, JSON.stringify(tripInfo));
            // Emit trip details to rider
            return Helper.emitByJid(riderId, TRIP_ENDED, JSON.stringify(tripInfo));
        } catch (error) {
            console.log(error);
            return socket.emit(ERROR, 'An error occurred while ending trip');
        }
    }
}
