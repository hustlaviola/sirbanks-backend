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
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    carDetails: {
        manufacturer: {
            type: String,
            default: null
        },
        model: {
            type: String,
            default: null
        },
        numberPlate: {
            type: String, default: null
        },
        colour: {
            type: String,
            default: null
        }
    },
    insuranceUrl: {
        type: String,
        default: null
    },
    vechilePaperUrl: {
        type: String,
        default: null
    },
    licenceUrl: {
        type: String,
        default: null
    },
    licenceDetails: {
        licenceNo: {
            type: String,
            default: null
        },
        issueDate: {
            type: Date,
            default: null
        },
        expDate: {
            type: Date,
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Lion = mongoose.model('user', UserSchema);

export default Lion;
