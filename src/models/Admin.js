import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String
    },
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    lastLoggedInAt: {
        type: Date
    },
    lastActivityAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Admin = mongoose.model('admin', AdminSchema);

export default Admin;
