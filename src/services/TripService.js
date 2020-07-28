import Trip from '../models/Trip';

/**
 * @class
 * @description
 * @exports TripService
 */
export default class TripService {
    /**
     * @method findTripById
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof TripService
     */
    static async findTripById(id) {
        const trip = await Trip.findById(id);
        if (!trip) return null;
        const tripDTO = {
            id: trip.id,
            driverId: trip.driverId,
            riderId: trip.riderId,
            pickUp: trip.pickUp,
            pickUpCoords: trip.pickUpLocation.coordinates,
            dropOff: trip.dropOff,
            dropOffCoords: trip.dropOffLocation.coordinates,
            status: trip.status,
            startTime: trip.startTime,
            endTime: trip.endTime,
            paymentMethod: trip.paymentMethod,
            distance: trip.distance,
            fare: trip.fare,
            createdAt: trip.createdAt
        };
        return tripDTO;
    }

    /**
     * @method getTripsCount
     * @description
     * @static
     * @returns {object} JSON response
     * @memberof TripService
     */
    static async getTripsCount() {
        return Trip.estimatedDocumentCount();
    }

    /**
     * @method getCurrentTripsCount
     * @description
     * @static
     * @returns {object} JSON response
     * @memberof TripService
     */
    static async getCurrentTripsCount() {
        return Trip.countDocuments({ status: 'transit' });
    }
}
