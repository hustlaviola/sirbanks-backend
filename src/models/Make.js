import mongoose from 'mongoose';

const { Schema } = mongoose;

const MakeSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Make = mongoose.model('make', MakeSchema);

export default Make;
