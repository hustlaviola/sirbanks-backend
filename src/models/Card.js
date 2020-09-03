import mongoose from 'mongoose';

const { Schema } = mongoose;

const CardSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    encrypted: {
        key: {
            type: String,
            required: true
        },
        iv: {
            type: String,
            required: true
        },
        crypt: {
            type: String,
            required: true
        }
    },
    signature: {
        type: String
    },
    brand: {
        type: String
    },
    bin: {
        type: String
    },
    bank: {
        type: String
    },
    accountName: {
        type: String
    },
    countryCode: {
        type: String
    },
    expMonth: {
        type: String
    },
    expYear: {
        type: String
    },
    default: {
        type: Boolean,
        default: true
    },
    type: {
        type: String
    },
    suffix: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Card = mongoose.model('card', CardSchema);

export default Card;
