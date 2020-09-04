import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rider',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'driver',
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
    payment: {
        method: {
            type: String,
            enum: ['cash', 'card', 'wallet']
        },
        cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'card'
        }
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
