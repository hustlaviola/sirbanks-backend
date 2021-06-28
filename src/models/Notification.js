import mongoose from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    image: {
        type: String
    },
    tag: {
        type: String
    },
    title: {
        type: String
    },
    body: {
        type: String
    },
    status: {
        type: String,
        default: 'unread',
        enum: ['unread', 'read']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

NotificationSchema.plugin(aggregatePaginate);

const Notification = mongoose.model('notification', NotificationSchema);

export default Notification;
