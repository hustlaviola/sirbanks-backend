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
        enum: ['fund_wallet', 'add_card', 'payment', 'payout']
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
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('transaction', TransactionSchema);

export default Transaction;
