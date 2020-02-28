import { validationResult } from 'express-validator';
import httpStatus from 'http-status';
import APIError from '../utils/errorHandler/ApiError';

const validate = async (req, res, next) => {
    // Finds validation errors in the request and wraps them in an array
    const errors = validationResult(req).array();

    if (errors.length) {
        const extractedErrors = [];
        errors.forEach(error => {
            const findError = extractedErrors.filter(err => err === error.msg);
            if (!findError.length) extractedErrors.push(error.msg);
        });
        const err = new APIError(extractedErrors.join('\n'), httpStatus.BAD_REQUEST, true);
        return next(err);
    }
    return next();
};

export default validate;
