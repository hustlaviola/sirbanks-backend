import { v4 as uuid } from 'uuid';

import Admin from '../models/Admin';
import Driver from '../models/Driver';
import Rider from '../models/Rider';
import Trip from '../models/Trip';
import Make from '../models/Make';
import Model from '../models/Model';

/**
 * @class
 * @description
 * @exports AdminService
 */
export default class AdminService {
    /**
     * @method adminExists
     * @description Check if admin exists
     * @static
     * @param {string} id
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async adminExists(id) {
        return (await Admin.findById(id).select(['_id'])) !== null;
    }

    /**
     * @method adminEmailExists
     * @description Check if admin email exists
     * @static
     * @param {string} email
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async adminEmailExists(email) {
        return (await Admin.findOne({ email }).select(['_id'])) !== null;
    }

    /**
     * @method adminPhoneExists
     * @description Check if admin phone exists
     * @static
     * @param {string} phone
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async adminPhoneExists(phone) {
        return (await Admin.findOne({ phone }).select(['_id'])) !== null;
    }

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
     * @method findByPhone
     * @description
     * @static
     * @param {object} phone
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async findByPhone(phone) {
        return Admin.findOne({ phone });
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
        // if (isDriver) {
        //     users = await Driver.find({
        //         onboardingStatus: { $in: ['completed', 'personal_details', 'vehicle_details'] }
        //     });
        // }
        if (isDriver) users = await Driver.find();
        else users = await Rider.find();
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
            reference: user.referenceId,
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
            userDTO.isActive = user.isActive;
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

    /**
     * @method deleteUser
     * @description
     * @static
     * @param {object} id
     * @param {boolean} isDriver
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async deleteUser(id, isDriver) {
        if (isDriver) return Driver.findByIdAndDelete(id);
        return Rider.findByIdAndDelete(id);
    }

    /**
     * @method createUser
     * @description
     * @static
     * @param {object} user
     * @param {boolean} isDriver
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static createUser(user, isDriver) {
        const publicId = `PB-${uuid()}`;
        const referenceId = `RF-${uuid()}`;
        user.publicId = publicId;
        user.referenceId = referenceId;
        if (isDriver) {
            return Driver.create(user);
        }
        return Rider.create(user);
    }

    /**
     * @method getMakes
     * @description
     * @static
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getMakes() {
        const makes = await Make.find();
        const makesDTO = makes.map(make => ({
            id: make.id,
            name: make.name
        }));
        return makesDTO;
    }

    /**
     * @method getModelsByMake
     * @description
     * @static
     * @param {object} make
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getModelsByMake(make) {
        const models = await Model.find({ make });
        const makesDTO = models.map(model => ({
            id: model.id,
            name: model.name
        }));
        return makesDTO;
    }

    /**
     * @method getAdmins
     * @description
     * @static
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getAdmins() {
        const admins = await Admin.find();
        const adminsDTO = admins.map(admin => ({
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            avatar: admin.avatar
        }));
        return adminsDTO;
    }

    /**
     * @method getAdmin
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static async getAdmin(id) {
        const admin = await Admin.findById(id);
        if (!admin) return null;
        const adminDTO = {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            avatar: admin.avatar,
            role: admin.role,
            lastLoggedInAt: admin.lastLoggedInAt,
            joinedAt: admin.createdAt
        };
        return adminDTO;
    }

    /**
     * @method searchDrivers
     * @description
     * @static
     * @param {object} query
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static searchDrivers(query) {
        return Driver.aggregate([
            {
                $match: {
                    $or: [
                        {
                            firstName: {
                                $regex: new RegExp(query),
                                $options: 'i'
                            }
                        },
                        {
                            lastName: {
                                $regex: new RegExp(query),
                                $options: 'i'
                            }
                        },
                        {
                            email: {
                                $regex: new RegExp(query),
                                $options: 'i'
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    isActive: 1,
                    isVerified: 1
                }
            }
        ]);
    }

    /**
     * @method searchRiders
     * @description
     * @static
     * @param {object} query
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static searchRiders(query) {
        return Rider.aggregate([
            {
                $match: {
                    $or: [
                        {
                            firstName: {
                                $regex: new RegExp(query),
                                $options: 'i'
                            }
                        },
                        {
                            lastName: {
                                $regex: new RegExp(query),
                                $options: 'i'
                            }
                        },
                        {
                            email: {
                                $regex: new RegExp(query),
                                $options: 'i'
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    firstName: 1,
                    lastName: 1,
                    email: 1
                }
            }
        ]);
    }

    /**
     * @method getRidersCount
     * @description
     * @static
     * @returns {object} JSON response
     * @memberof AdminService
     */
    static getRidersCount() {
        return Rider.countDocuments();
    }
}
