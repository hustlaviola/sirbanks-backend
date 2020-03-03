import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
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
    gender: {
        type: String,
        enum: ['male', 'female', 'prefer not to say']
    },
    dob: {
        type: Date
    },
    address: {
        type: String
    },
    role: {
        type: String,
        enum: ['driver', 'rider', 'admin'],
        required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    isOnline: {
        type: Boolean
    },
    isAvailable: {
        type: Boolean
    },
    carDetails: {
        manufacturer: {
            type: String
        },
        model: {
            type: String
        },
        numberPlate: {
            type: String
        },
        colour: {
            type: String
        }
    },
    insuranceUrl: {
        type: String
    },
    vechilePaperUrl: {
        type: String
    },
    licenceUrl: {
        type: String
    },
    licenceDetails: {
        licenceNo: {
            type: String
        },
        issueDate: {
            type: Date
        },
        expDate: {
            type: Date
        }
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Lion = mongoose.model('user', UserSchema);

export default Lion;
