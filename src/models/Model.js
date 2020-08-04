import mongoose from 'mongoose';

const { Schema } = mongoose;

const ModelSchema = new Schema({
    make: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'make',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Model = mongoose.model('model', ModelSchema);

export default Model;
