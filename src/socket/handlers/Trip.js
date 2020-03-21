/* eslint-disable import/no-cycle */
import {
    ERROR,
    SUCCESS,
    NO_DRIVER_FOUND
} from '../events';
import Driver from '../../models/Driver';
// import Rider from '../../models/Rider';
import Helper from '../Helper';
import { dispatchP } from '../index';

// import { clients } from '../index';

/**
 * @class
 * @description A handler class for Authentication
 * @exports Trip
 */
export default class Trip {
    /**
     * @method updateLocation
     * @description
     * @static
     * @param {object} socket - Request object
     * @param {object} data - Response object
     * @returns {object} JSON response
     * @memberof Trip
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
            const location = { coordinates: [lon, lat] };
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
     * @memberof Trip
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
     * @memberof Trip
     */
    static async requestRide(data) {
        try {
            const {
                id, pickupLon, pickupLat, newDrivers
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
                            near: { type: 'Point', coordinates: [Number(pickupLon), Number(pickupLat)] },
                            distanceField: 'dist.calculated',
                            maxDistance: 3000,
                            spherical: true
                        }
                    }
                ]);
                console.log(drivers);
            } else {
                drivers = newDrivers;
            }
            if (drivers.length < 1) {
                return Helper.emitByID(id, NO_DRIVER_FOUND, 'No driver found');
            }
            await dispatchP(data, drivers);
            return Helper.emitByJid(id, NO_DRIVER_FOUND, 'No driver found');
        } catch (error) {
            console.log(error);
        }
    }
}
