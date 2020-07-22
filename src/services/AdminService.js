import Admin from '../models/Admin';
import Driver from '../models/Driver';
import Rider from '../models/Rider';
import Trip from '../models/Trip';

/**
 * @class
 * @description
 * @exports AdminService
 */
export default class AdminService {
    /**
     * @method findByEmail
     * @description
     * @static
     * @param {object} email
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async findByEmail(email) {
        return Admin.findOne({ email });
    }

    /**
     * @method findById
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async findById(id) {
        return Admin.findById(id);
    }

    /**
     * @method createAdmin
     * @description
     * @static
     * @param {object} admin
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async createAdmin(admin) {
        return Admin.create(admin);
    }

    /**
     * @method getUsers
     * @description
     * @static
     * @param {object} isDriver
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getUsers(isDriver) {
        let users;
        if (isDriver) users = await Driver.find({ onboardingStatus: { $in: ['completed', 'personal_details'] } });
        else users = await Rider.find({ onboardingStatus: 'completed' });
        const usersDTO = users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar
        }));
        return usersDTO;
    }

    /**
     * @method getUser
     * @description
     * @static
     * @param {object} id
     * @param {boolean} isDriver
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getUser(id, isDriver) {
        let user = null;
        if (isDriver) user = await Driver.findById(id);
        else user = await Rider.findById(id);
        if (!user) return null;
        const userDTO = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            currentTripId: user.currentTripId,
            currentTripStatus: user.currentTripStatus,
            onboardingStatus: user.onboardingStatus,
            walletBalance: user.walletBalance,
            coordinates: user.location.coordinates,
            isEmailVerified: user.isEmailVerified,
            lastLoggedInAt: user.lastLoggedInAt,
            joinedAt: user.createdAt
        };
        if (isDriver) {
            userDTO.isOnline = user.isOnline;
            userDTO.isAvailable = user.isAvailable;
            userDTO.isApproved = user.isApproved;
            userDTO.vehicleDetails = user.vehicleDetails;
        }
        return userDTO;
    }

    /**
     * @method getTrips
     * @description
     * @static
     * @param {object} id
     * @param {object} isDriver
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getTrips(id, isDriver) {
        let trips;
        if (isDriver) trips = await Trip.find({ driverId: id });
        else trips = await Trip.find({ riderId: id });
        const tripsDTO = trips.map(trip => ({
            id: trip.id,
            driverId: trip.driverId,
            riderId: trip.riderId,
            pickUp: trip.pickUp,
            dropOff: trip.dropOff,
            status: trip.status,
            fare: trip.fare,
            createdAt: trip.createdAt
        }));
        return tripsDTO;
    }

    /**
     * @method getTrip
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getTrip(id) {
        const trip = await Trip.findOne({ id });
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
}
