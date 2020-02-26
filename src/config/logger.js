import winston from 'winston';

const winstonInstance = new winston.createLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
});

export default winstonInstance;
