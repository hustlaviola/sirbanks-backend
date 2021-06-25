import mongoose from 'mongoose';

const { Schema } = mongoose;

const RiderSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
    avatar: {
        type: String
    },
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    addedCard: {
        type: Boolean,
        default: false
    },
    device: {
        platform: {
            type: String
        },
        token: {
            type: String
        }
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
        default: null,
        enum: [null, 'accepted', 'transit']
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
