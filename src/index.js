import express from 'express';
import debug from 'debug';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import httpStatus from 'http-status';
import expressWinston from 'express-winston';

import connectDB from './config/db';
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

// Log error in winston transports when executing in development
if (process.env.NODE_ENV === 'development') {
    app.use(expressWinston.errorLogger({
        winstonInstance
    }));
}

const { PORT } = process.env;

app.listen(PORT, () => log(`listening on port: ${PORT}..`));

export default app;
