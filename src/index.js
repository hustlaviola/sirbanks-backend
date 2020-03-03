import express from 'express';
import debug from 'debug';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import httpStatus from 'http-status';
import trimmer from 'trim-request-body';
import expressWinston from 'express-winston';

import connectDB from './config/db';
import messages from './utils/messages';
import response from './utils/response';
import {
    userRouter, authRouter
} from './routes/index';
import APIError from './utils/errorHandler/ApiError';
import handleError from './utils/errorHandler/handleError';
import winstonInstance from './config/logger';

const app = express();

const log = debug('app:http');

connectDB();
app.use(express.json());

// Compress response
app.use(compression());

app.use(express.urlencoded({ extended: true }));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// Trim request body
app.use(trimmer);

app.set('view engine', 'ejs');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

app.get('/', (req, res) => response(res, 200, messages.root));

// Handle route 404
app.all('/*', (req, res, next) => {
    const err = new APIError(messages.pageNotFound, httpStatus.NOT_FOUND, true);
    return next(err);
});

// Log error in winston transports when executing in development
if (process.env.NODE_ENV === 'development') {
    app.use(expressWinston.errorLogger({
        winstonInstance
    }));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (!err.isOperational) {
        log(err);
        process.exit(1);
    }
    handleError(err, res);
});


const { PORT } = process.env;

app.listen(PORT, () => console.log(`listening on port: ${PORT}..`));

export default app;
