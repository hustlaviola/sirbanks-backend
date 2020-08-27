import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['fund_wallet', 'add_card', 'payout']
    },
    status: {
        type: String,
        default: 'initiated',
        enum: ['initiated', 'success', 'failed']
    },
    narration: {
        type: String
    },
    reference: {
        type: String,
        required: true
    },
    paidAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('transaction', TransactionSchema);

export default Transaction;
