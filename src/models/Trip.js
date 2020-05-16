import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
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
    tripId: {
        type: String,
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
        default: 'accepted',
        enum: ['accepted', 'canceled', 'transit', 'ended']
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet']
    },
    distance: {
        type: Number
    },
    fare: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

TripSchema.index({ pickUpLocation: '2dsphere' }, { dropOffLocation: '2dsphere' });

const Trip = mongoose.model('trip', TripSchema);

export default Trip;
