/* eslint-disable import/no-cycle */
import { getDistance } from 'geolib';
import {
    ERROR,
    SUCCESS,
    NO_DRIVER_FOUND,
    DRIVER_FOUND
} from '../events';
import Driver from '../../models/Driver';
import Trip from '../../models/Trip';
// import Rider from '../../models/Rider';
import Helper from '../Helper';
import { clients, dispatchP } from '../index';

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
            if (!Helper.auth(id)) {
                return socket.emit(ERROR, 'Unauthorized');
            }
            // const { firstName, avatar, vehicleDetails } = clients[id].userInfo;
            const driver = await Driver.findById(id);
            if (!driver) {
                return Helper.emitByID(id, ERROR, 'User not found');
            }
            const location = { type: 'Point', coordinates: [Number(lon), Number(lat)] };
            driver.location = location;
            await driver.save();
            // if (trip) {
            //     const { pickup_lat, pickup_lon } = trip;
            //     const distance = getDistance(
            //         { latitude: pickup_lat, longitude: pickup_lon },
            //         { latitude: lat, longitude: lon }
            //     );
            //     if (clients[trip.rider_jid]) {
            //         const driver_details = {
            //             driver_name: name, image_url, lon, lat, distance, vehicle_details
            //         };
            //         if (distance <= 200) {
            //             return Helper.emitByJid(
            //                 trip.rider_jid, ARRIVED, JSON.stringify(driver_details)
            //             );
            //         } else if (distance <= 600) {
            //             return Helper.emitByJid(
            //                 trip.rider_jid, ARRIVING, JSON.stringify(driver_details)
            //             );
            //         } else {
            //             return Helper.emitByJid(
            //                 trip.rider_jid, ENROUTE, JSON.stringify(driver_details)
            //             );
            //         }
            //     }
            // }
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
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof TripHandler
     */
    static async requestRide(data) {
        try {
            const {
                id, pickUpLon, pickUpLat, newDrivers
            } = data;
            // If a driver declines request and the rider is no longer online
            // Request won't be routed to another driver
            if (!Helper.auth(id)) return;
            console.log('Searching for drivers');
            let drivers;
            if (!newDrivers) {
                drivers = await Driver.aggregate([
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
                            tripStatus: 'none'
                        }
                    }
                ]);
            } else {
                drivers = newDrivers;
            }
            if (drivers.length < 1) {
                return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
            }
            await dispatchP(data, drivers);
            return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
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
            const { id, lon, lat } = data;
            if (!Helper.auth(id)) {
                return socket.emit(ERROR, 'Unauthorized');
            }
            const {
                riderId, pickUp, dropOff, paymentMethod, pickUpLon,
                pickUpLat, dropOffLon, dropOffLat, tripId
            } = data;
            const pickUpLocation = { coordinates: [Number(pickUpLon), Number(pickUpLat)] };
            const dropOffLocation = { coordinates: [Number(dropOffLon), Number(dropOffLat)] };
            let trip = {
                riderId,
                driverId: id,
                pickUp,
                pickUpLocation,
                dropOff,
                dropOffLocation,
                tripRequestId: tripId,
                status: 'accepted',
                paymentMethod
            };
            const driver = await Driver.findById(id);
            driver.tripStatus = 'accepted';
            await driver.save();
            // await driver.save({ tripStatus: 'accepted' });
            trip = await Trip.create(trip);

            // If the rider is still online
            const {
                firstName, avatar, vehicleDetails
            } = clients[id].userInfo;
            const distance = getDistance(
                { latitude: pickUpLat, longitude: pickUpLon },
                { latitude: lat, longitude: lon }
            );
            const driverDetails = {
                driverName: firstName, avatar, lon, lat, distance, vehicleDetails
            };
            const newTrip = {
                riderId,
                driverId: trip.driverId,
                pickUp,
                pickUpLon,
                pickUpLat,
                dropOff,
                dropOffLon,
                dropOffLat,
                distance,
                driverDetails
            };
            Helper.emitByID(data.riderId, DRIVER_FOUND, JSON.stringify(newTrip));
            console.log('Request accepted');
            return Helper.emitByID(id, SUCCESS, 'You have successfully accepted the request');
        } catch (error) {
            console.log(error);
        }
    }
}
