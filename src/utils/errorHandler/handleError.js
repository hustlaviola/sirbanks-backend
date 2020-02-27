import httpStatus from 'http-status';

const handleError = (err, res) => res.status(err.status).send({
    status: 'error',
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
});

export default handleError;
