import httpStatus from 'http-status';
import APIError from '../utils/errorHandler/ApiError';
import messages from '../utils/messages';
import { debug } from '../config/logger';
import TripService from '../services/TripService';

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
            const { id, permissions } = req.user;
            const isAllowed = (trip.riderId.toString() === id.toString()
                || trip.driverId.toString() === id.toString());
            if (!permissions) {
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
}
