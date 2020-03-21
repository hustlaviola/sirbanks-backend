import mongoose from 'mongoose';

const TripRequestSchema = new mongoose.Schema({
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'riders',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drivers',
        required: true
    },
    pickUp: {
        type: String
    },
    pickUpLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    dropOff: {
        type: String
    },
    dropOffLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted']
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TripRequest = mongoose.model('trip_request', TripRequestSchema);

export default TripRequest;
