import Transaction from '../models/Transaction';

/**
 * @class
 * @description
 * @exports TransactionService
 */export default class TransactionService {
    /**
     * @method createTransaction
     * @description
     * @static
     * @param {object} transaction
     * @returns {object} JSON response
     * @memberof TransactionService
     */
    static async createTransaction(transaction) {
        return Transaction.create(transaction);
    }

    /**
     * @method getUserTransactionHistory
     * @description
     * @static
     * @param {object} id
     * @returns {object} JSON response
     * @memberof TransactionService
     */
    static async getUserTransactionHistory(id) {
        return Transaction.find({ user: id });
    }

    /**
     * @method getTransactionByRef
     * @description
     * @static
     * @param {object} reference
     * @returns {object} JSON response
     * @memberof TransactionService
     */
    static async getTransactionByRef(reference) {
        return Transaction.findOne({ reference });
    }
}
