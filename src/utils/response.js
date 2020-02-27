/**
 * @function response
 * @description Response
 * @param {object} res - Response object
 * @param {object} code - HTTP status code
 * @param {object} message - Status message e.g 'success'
 * @param {object} data - Response object
 * @returns {object} Response object
 */
const response = (res, code, message, data = {}) => res.status(code).send({
    status: 'success',
    message,
    data
});

export default response;
