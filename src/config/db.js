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
            useUnifiedTopology: true
        });
        log('MongoDB connected..');
    } catch (error) {
        log(error);
        process.exit(1);
    }
};

export default connectDB;
