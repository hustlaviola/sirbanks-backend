import httpStatus from 'http-status';
import request from 'request';
import crypto from 'crypto';

import paystack from '../config/paystack';
import TransactionService from '../services/TransactionService';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';
import UserService from '../services/UserService';

const log = debug('app:onboarding-middleware');

const { initialize, refund } = paystack(request);

/**
 * @class
 * @description
 * @exports Transaction
 */
export default class Transaction {
    /**
     * @method createTransaction
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static async createTransaction(req, res, next) {
        const {
            amount, email, name, reference, type
        } = req.body;
        const exists = await TransactionService.getTransactionByRef(reference);
        log('eXIST', exists);
        if (exists) {
            return next(new APIError('reference already exists', httpStatus.CONFLICT, true));
        }
        const { id } = req.user;
        const transaction = {
            amount,
            user: id,
            reference,
            narration: `${type} for ${name}, email: ${email}`,
            type
        };
        try {
            await TransactionService.createTransaction(transaction);
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method confirmPayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static async confirmPayment(req, res) {
        log('IP ADDRESS: ', req.ip);
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
        if (hash === req.headers['x-paystack-signature']) {
            try {
                const { data } = req.body;
                const { authorization, customer, reference } = data;
                const transaction = await TransactionService.getTransactionByRef(reference);
                if (!transaction) {
                    log('TRANSACTION NOT FOUND');
                    // TODO
                } else {
                    // transaction.paidAt = data.paidAt;
                    const user = await UserService.findById(transaction.user);
                    if (!user) {
                        log('USER NOT FOUND');
                        // TODO
                    } else if (transaction.type === 'add_card') {
                        log(`ADDING CARD USER: ${user}, REF: ${reference}`);
                        const form = { transaction: reference };
                        refund(form, (err, body) => {
                            if (err) {
                                log(err);
                                // TODO
                            } else {
                                transaction.paidAt = body.data.transaction.paid_at;
                                transaction.status = 'success';
                                transaction.narration += req.body.message;
                                user.addedCard = true;
                                user.paymentDetails = {
                                    authCode: authorization.authorization_code,
                                    cardSuffix: authorization.last4,
                                    email: customer.email
                                };
                            }
                        });
                        await transaction.save();
                        await user.save();
                        log('ADD CARD AND REFUND SUCCESSFUL');
                    } else if (transaction.type === 'fund_wallet') {
                        log(`FUNDING WALLET USER: ${user}, REF: ${reference}`);
                        transaction.status = 'success';
                        transaction.paidAt = new Date(data.paidAt);
                        user.walletBalance += (data.amount / 100);
                        await transaction.save();
                        await user.save();
                        log('FUNDING WALLET SUCCESSFUL');
                    } else {
                        log(`PAYING OUT USER: ${user}, REF: ${reference}`);
                        transaction.status = 'success';
                        transaction.paidAt = new Date(data.paidAt);
                        user.walletBalance -= (data.amount / 100);
                        await transaction.save();
                        await user.save();
                        log('PAYOUT SUCCESSFULL');
                    }
                }
            } catch (error) {
                // TODO
                log(error);
            }
        }
        return res.status(200).send();
    }

    /**
     * @method initiatePayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static async initiatePayment(req, res, next) {
        const {
            amount, email, name
        } = req.body;
        const form = {
            amount: amount * 100,
            email,
            full_name: name
        };
        form.metadata = {
            full_name: form.full_name
        };
        initialize(form, (err, body) => {
            if (err) {
                log(err);
                return next(new APIError(
                    'Error while initializing payment', httpStatus.BAD_REQUEST, true
                ));
            }
            log(body);
            const response = JSON.parse(body);
            res.send(response);
        });
    }

    /**
     * @method sendBack
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Transaction
     */
    static async sendBack(req, res) {
        log('REFUNDING TAIWO');
        const form = { transaction: 'b35e8066-6ed5-43d4-abf3-0040e86342df' };
        refund(form, (err, body) => {
            if (err) {
                log(err);
                // TODO
            } else {
                log('TAIWO REFUNDED');
                log(body);
            }
        });
        res.status(200).send('TAIWO REFUNDED');
    }
}
