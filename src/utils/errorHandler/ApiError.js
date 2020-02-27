import httpStatus from 'http-status';
import ExtendableError from './ExtendableError';

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
export default class APIError extends ExtendableError {
    /**
     * @method constructor
     * @param {String} message - Error message
     * @param {Number} status - HTTP status code of error
     * @param {Boolean} isPublic -  - Whether the message should be visible to user or not
     */
    constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = false) {
        super(message, status, isPublic);
    }
}
