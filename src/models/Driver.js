import mongoose from 'mongoose';

const { Schema } = mongoose;

const DriverSchema = new Schema({
    email: {
        type: String,
        unique: true,
        sparse: true
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
    avatar: {
        type: String
    },
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    referenceId: {
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
    isEmailVerified: {
        type: Boolean,
        default: false
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
    isOnline: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    vehicleDetails: {
        make: {
            type: String
        },
        model: {
            type: String
        },
        year: {
            type: Number
        },
        numberPlate: {
            type: String
        },
        color: {
            type: String
        },
        insuranceUrl: {
            type: String
        },
        vehiclePaperUrl: {
            type: String
        },
        licenceDetails: {
            licenceUrl: {
                type: String
            },
            licenceNo: {
                type: String
            },
            issueDate: {
                type: Date
            },
            expDate: {
                type: Date
            }
        }
    },
    onboardingStatus: {
        type: String,
        default: 'initiated',
        enum: ['initiated', 'personal_details', 'vehicle_details', 'completed']
    },
    isActive: {
        type: Boolean,
        default: false
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
    lastLoggedInAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

DriverSchema.index({ location: '2dsphere' });
const Driver = mongoose.model('driver', DriverSchema);

export default Driver;
