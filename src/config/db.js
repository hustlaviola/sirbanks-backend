import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { debug } from './logger';

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
