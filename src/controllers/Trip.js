import httpStatus from 'http-status';

import response from '../utils/response';
import messages from '../utils/messages';

/**
 * @class
 * @description
 * @exports Trip
 */export default class Trip {
    /**
     * @method getTrip
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @returns {object} JSON response
     * @memberof Trip
     */
    static getTrip(req, res) {
        const { trip } = req;
        return response(res, httpStatus.OK, messages.tripRetrievalSuccess, trip);
    }
}
