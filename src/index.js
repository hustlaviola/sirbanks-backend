import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import httpStatus from 'http-status';
import trimmer from 'trim-request-body';
import expressWinston from 'express-winston';
import fileupload from 'express-fileupload';
import http from 'http';

import connectDB from './config/db';
import messages from './utils/messages';
import {
    driverRouter,
    authRouter,
    onboardingRouter,
    indexRouter,
    userRouter,
    adminRouter,
    tripRouter,
    transactionRouter,
    paymentRouter,
    cardRouter
} from './routes/index';
import APIError from './utils/errorHandler/ApiError';
import handleError from './utils/errorHandler/handleError';
import winstonInstance, { debug } from './config/logger';

import SocketServer from './socket/index';

const app = express();

const log = debug('app:http');

connectDB();
app.use(express.json());

// Compress response
app.use(compression());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(fileupload({
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    abortOnLimit: true,
    responseOnLimit: messages.fileLimitReached,
    useTempFiles: true
}));

// secure apps by setting various HTTP headers
app.use(helmet());

// Trim request body
app.use(trimmer);

app.set('view engine', 'ejs');

app.use('/api/v1/onboarding', onboardingRouter);
app.use('/api/v1/drivers', driverRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/trips', tripRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/cards', cardRouter);
app.use(indexRouter);

app.get('/', (req, res) => res.send(`<h1>${messages.root}</h1>`));

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
        log(`Operational Error============================${err}`);
    }
    handleError(err, res);
});

const { PORT } = process.env;

const server = http.createServer(app);

SocketServer.createServer(server);

server.listen(PORT, () => log(`listening on port: ${PORT}..`));

export default server;
