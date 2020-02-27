/**
 * @extends Error
 */
export default class ExtendableError extends Error {
    /**
     * @method constructor
     * @param {String} message - Error message
     * @param {Number} status - HTTP status code of error
     * @param {Boolean} isPublic -  - Whether the message should be visible to user or not
     */
    constructor(message, status, isPublic) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.isPublic = isPublic;
        this.message = message;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor.name);
    }
}
