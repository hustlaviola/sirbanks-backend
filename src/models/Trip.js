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
        enum: ['accepted', 'cancelled', 'transit', 'ended']
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

TripSchema.index({ pickUpLocation: '2dsphere' }, { dropOffLocation: '2dsphere' });

const Trip = mongoose.model('trip', TripSchema);

export default Trip;
