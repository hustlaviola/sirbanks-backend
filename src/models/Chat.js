import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model('chat', ChatSchema);

export default Chat;
