import winston from 'winston';
import debug from 'debug';

const winstonInstance = new winston.createLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
});

export default winstonInstance;
export { debug };
