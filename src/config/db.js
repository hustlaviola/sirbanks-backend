import mongoose from 'mongoose';
import debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

const log = debug('app:mongo');

const db = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            bufferCommands: false,
            useFindAndModify: false
        });
        log('MongoDB connected..');
    } catch (error) {
        log(error);
    }
};

export default connectDB;
