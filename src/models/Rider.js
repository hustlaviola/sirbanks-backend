import mongoose from 'mongoose';

const { Schema } = mongoose;

const RiderSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    myPublicId: {
        type: String,
        required: true,
        unique: true
    },
    referenceId: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    currentTripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips',
        default: null
    },
    currentTripStatus: {
        type: String,
        default: 'none',
        enum: ['none', 'accepted', 'canceled', 'transit', 'ended']
    },
    onboardingStatus: {
        type: String,
        default: 'initiated',
        enum: ['initiated', 'completed']
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLoggedInAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

RiderSchema.index({ location: '2dsphere' });
const Rider = mongoose.model('rider', RiderSchema);

export default Rider;
