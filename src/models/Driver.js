import mongoose from 'mongoose';

const { Schema } = mongoose;

const DriverSchema = new Schema({
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
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String
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
        type: Boolean
    },
    isAvailable: {
        type: Boolean
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
        enum: ['initiated', 'email_verified', 'vehicle_details', 'completed']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    tripStatus: {
        type: String,
        default: 'none',
        enum: ['none', 'accepted', 'transit']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

DriverSchema.index({ location: '2dsphere' });
const Driver = mongoose.model('driver', DriverSchema);

export default Driver;
