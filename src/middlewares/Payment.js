import httpStatus from 'http-status';
import request from 'request';
import crypto from 'crypto';
import requestIp from 'request-ip';

import paystack from '../config/paystack';
import TransactionService from '../services/TransactionService';
import messages from '../utils/messages';
import APIError from '../utils/errorHandler/ApiError';
import { debug } from '../config/logger';
import UserService from '../services/UserService';
import Helper from '../utils/helpers/Helper';
import CardService from '../services/CardService';

const log = debug('app:onboarding-middleware');

const { initialize, refund } = paystack(request);

/**
 * @class
 * @description
 * @exports Payment
 */
export default class Payment {
    /**
     * @method confirmPayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Payment
     */
    static async confirmPayment(req, res, next) {
        const ip = requestIp.getClientIp(req);
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
        log('HASH', hash);
        log('x-paystack-signature', req.headers['x-paystack-signature']);
        log(hash === req.headers['x-paystack-signature']);
        log(JSON.stringify(req.body));
        const validIps = ['52.31.139.75', '52.49.173.169', '52.214.14.220'];
        if (!validIps.includes(ip)) {
            log('========= E NO EQUAL OOOOOOO ===========');
            return next(new APIError(
                messages.unauthorized, httpStatus.UNAUTHORIZED, true
            ));
        }
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
                    log(`ADDING CARD USER: ${user.id}, REF: ${reference}`);
                    const form = { transaction: reference };
                    refund(form, async (err, body) => {
                        if (err) {
                            log('======================', err);
                            // TODO
                        } else {
                            body = JSON.parse(body);
                            log('BODY ========', body);
                            if (body.status) {
                                transaction.paidAt = body.data.transaction.paid_at;
                                transaction.channel = body.data.transaction.channel;
                                log('asfffff==================');
                                transaction.status = 'success';
                                transaction.narration += req.body.message;
                                if (authorization.reusable) {
                                    user.addedCard = true;
                                    const encryptedData = await Helper.encrypt(
                                        authorization.authorization_code
                                    );
                                    const card = {
                                        user: user.id,
                                        encrypted: {
                                            key: encryptedData.key,
                                            iv: encryptedData.iv,
                                            crypt: encryptedData.crypt
                                        },
                                        suffix: authorization.last4,
                                        brand: authorization.brand,
                                        type: authorization.card_type,
                                        email: customer.email
                                    };
                                    log('CARD -------', card);
                                    const defaultCard = await CardService.getDefaultCard(user.id);
                                    if (defaultCard) {
                                        defaultCard.default = false;
                                        await defaultCard.save();
                                    }
                                    await CardService.addCard(card);
                                    await user.save();
                                } else {
                                    transaction.channel = body.data.transaction.channel;
                                    transaction.narration = `Card was not added, wrong payment channel ${body.data.transaction.channel}`;
                                }
                            }
                        }
                        await transaction.save();
                        log('ADD CARD AND REFUND SUCCESSFUL');
                    });
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
        return next();
    }

    /**
     * @method initiatePayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Payment
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
}
