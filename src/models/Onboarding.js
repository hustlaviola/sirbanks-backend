import mongoose from 'mongoose';

const OnboardingSchema = new mongoose.Schema({
    role: {
        type: String,
        default: 'rider',
        enum: ['rider', 'driver']
    },
    code: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    deviceToken: {
        type: String
    },
    devicePlatform: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
});

const Onboarding = mongoose.model('onboarding', OnboardingSchema);

export default Onboarding;
