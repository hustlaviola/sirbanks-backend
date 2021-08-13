import httpStatus from 'http-status';
import APIError from '../utils/errorHandler/ApiError';
import messages from '../utils/messages';
import { debug } from '../config/logger';
import TripService from '../services/TripService';
import Helper from '../utils/helpers/Helper';
import adminRoles from '../config/constants';

const log = debug('app:onboarding-middleware');

/**
 * @class
 * @description
 * @exports Trip
 */
export default class Trip {
    /**
     * @method validateGetTrip
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Trip
     */
    static async validateGetTrip(req, res, next) {
        const { tripId } = req.params;
        try {
            const trip = await TripService.findTripById(tripId);
            if (!trip) {
                return next(new APIError(
                    messages.tripNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            const { id, role } = req.user;
            const isAllowed = (trip.riderId.toString() === id.toString()
                || trip.driverId.toString() === id.toString());
            if (!role.includes(['admin', 'super admin'])) {
                if (!isAllowed) {
                    return next(new APIError(
                        messages.unauthorized, httpStatus.UNAUTHORIZED, true
                    ));
                }
            }
            req.trip = trip;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method validateTripsCount
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Trip
     */
    static async validateTripsCount(req, res, next) {
        if (!adminRoles.includes(req.user.role)) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            const { startDate, endDate, statuses } = req.query;
            const tripStatusError = Helper.tripStatusError(statuses);
            if (tripStatusError) {
                return next(new APIError(
                    tripStatusError, httpStatus.BAD_REQUEST, true
                ));
            }
            if (startDate && !Helper.isValidDate(startDate)) {
                return next(new APIError(
                    'please provide a valid startDate', httpStatus.BAD_REQUEST, true
                ));
            }
            if (endDate && !Helper.isValidDate(endDate)) {
                return next(new APIError(
                    'please provide a valid endDate', httpStatus.BAD_REQUEST, true
                ));
            }
            if (startDate && endDate && new Date(startDate) < new Date(endDate)) {
                return next(new APIError(
                    'endDate cannot come after startDate', httpStatus.BAD_REQUEST, true
                ));
            }
            if (startDate && Date.now() < new Date(startDate)) {
                return next(new APIError(
                    'startDate cannot come after the present time', httpStatus.BAD_REQUEST, true
                ));
            }
            if (!startDate && endDate && Date.now() < new Date(endDate)) {
                return next(new APIError(
                    'endDate cannot come after the present time', httpStatus.BAD_REQUEST, true
                ));
            }
            const count = await TripService.getTripsCount(startDate, endDate, statuses);
            req.totalTrips = count;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    // /**
    //  * @method validateCurrentTripsCount
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof Trip
    //  */
    // static async validateCurrentTripsCount(req, res, next) {
    //     if (!adminRoles.includes(req.user.role)) {
    //         return next(new APIError(
    //             messages.unauthorized, httpStatus.UNAUTHORIZED, true
    //         ));
    //     }
    //     try {
    //         const count = await TripService.getCurrentTripsCount();
    //         req.currentTrips = count;
    //         return next();
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }

    // /**
    //  * @method validateTripsCountByDate
    //  * @description
    //  * @static
    //  * @param {object} req - Request object
    //  * @param {object} res - Response object
    //  * @param {object} next
    //  * @returns {object} JSON response
    //  * @memberof Trip
    //  */
    // static async validateTripsCountByDate(req, res, next) {
    //     if (!adminRoles.includes(req.user.role)) {
    //         return next(new APIError(
    //             messages.unauthorized, httpStatus.UNAUTHORIZED, true
    //         ));
    //     }
    //     try {
    //         const { startDate, endDate } = req.query;
    //         if (!Helper.isValidDate(startDate)) {
    //             return next(new APIError(
    //                 'please provide a valid startDate', httpStatus.BAD_REQUEST, true
    //             ));
    //         }
    //         if (!Helper.isValidDate(endDate)) {
    //             return next(new APIError(
    //                 'please provide a valid endDate', httpStatus.BAD_REQUEST, true
    //             ));
    //         }
    //         if (new Date(startDate) < new Date(endDate)) {
    //             return next(new APIError(
    //                 'endDate cannot come after startDate', httpStatus.BAD_REQUEST, true
    //             ));
    //         }
    //         if (Date.now() < new Date(startDate)) {
    //             return next(new APIError(
    //                 'startDate cannot come after the present time', httpStatus.BAD_REQUEST, true
    //             ));
    //         }
    //         const count = await TripService.getTripsCountByDate(startDate, endDate);
    //         req.totalTrips = count;
    //         return next();
    //     } catch (error) {
    //         log(error);
    //         return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
    //     }
    // }

    /**
     * @method validateGetTrips
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Trip
     */
    static async validateGetTrips(req, res, next) {
        if (!adminRoles.includes(req.user.role)) {
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
        try {
            const { startDate, endDate, statuses } = req.query;
            const tripStatusError = Helper.tripStatusError(statuses);
            if (tripStatusError) {
                return next(new APIError(
                    tripStatusError, httpStatus.BAD_REQUEST, true
                ));
            }
            if (startDate && !Helper.isValidDate(startDate)) {
                return next(new APIError(
                    'please provide a valid startDate', httpStatus.BAD_REQUEST, true
                ));
            }
            if (endDate && !Helper.isValidDate(endDate)) {
                return next(new APIError(
                    'please provide a valid endDate', httpStatus.BAD_REQUEST, true
                ));
            }
            if (startDate && endDate && new Date(startDate) < new Date(endDate)) {
                return next(new APIError(
                    'endDate cannot come after startDate', httpStatus.BAD_REQUEST, true
                ));
            }
            if (startDate && Date.now() < new Date(startDate)) {
                return next(new APIError(
                    'startDate cannot come after the present time', httpStatus.BAD_REQUEST, true
                ));
            }
            if (!startDate && endDate && Date.now() < new Date(endDate)) {
                return next(new APIError(
                    'endDate cannot come after the present time', httpStatus.BAD_REQUEST, true
                ));
            }
            let trips = await TripService.getTrips(startDate, endDate, statuses);
            trips = Helper.formatAdminTrips(trips);
            req.trips = trips;
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
