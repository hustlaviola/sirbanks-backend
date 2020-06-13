import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    tokenType: {
        type: String,
        required: true,
        enum: ['email', 'password']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 43200
    }
});

const Token = mongoose.model('token', TokenSchema);

export default Token;
