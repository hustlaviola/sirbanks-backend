import httpStatus from 'http-status';
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
import promiseHandler from '../utils/promiseHandler';

const log = debug('app:onboarding-middleware');

const {
    initialize, refund, chargeAuth, verify
} = paystack();

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
        if (req.body.event !== 'charge.success') {
            // transaction.status = 'failed';
        }
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
            if (!Helper.isValidKey(reference, 'TX-')) {
                log(data);
                log(JSON.stringify(data));
                // TODO: save transaction
                return;
            }
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
                                        bin: authorization.bin,
                                        signature: authorization.signature,
                                        bank: authorization.bank,
                                        countryCode: authorization.country_code,
                                        accountName: authorization.account_name,
                                        expMonth: authorization.exp_month,
                                        expYear: authorization.exp_year,
                                        suffix: authorization.last4,
                                        brand: authorization.brand,
                                        type: authorization.card_type,
                                        email: customer.email
                                    };
                                    log('CARD -------', card);
                                    let conflictCard;
                                    const cards = await CardService.getAllDisplayableCards(user.id);
                                    for (let i = 0; i < cards.length; i += 1) {
                                        if (cards[i].signature === card.signature) {
                                            log('ONE EQUAL AM OOOOO');
                                            conflictCard = cards[i].id;
                                            break;
                                        }
                                    }
                                    if (conflictCard) {
                                        card.default = true;
                                        await CardService.updateCardById(conflictCard, card);
                                        // await CardService.removeCard(conflictCard);
                                    } else {
                                        await CardService.addCard(card);
                                    }
                                    const defaultCard = await CardService.getDefaultCard(user.id);
                                    if (defaultCard) {
                                        defaultCard.default = false;
                                        await defaultCard.save();
                                    }
                                    await user.save();
                                } else {
                                    transaction.channel = body.data.transaction.channel;
                                    transaction.narration = `Card was not added, wrong payment channel ${body.data.transaction.channel}`;
                                }
                            }
                        }
                        transaction.updatedAt = Date.now();
                        await transaction.save();
                        log('ADD CARD AND REFUND SUCCESSFUL');
                        return next();
                    });
                } else if (transaction.type === 'fund_wallet') {
                    // TODO - Save transaction channel
                    log(`FUNDING WALLET USER: ${user}, REF: ${reference}`);
                    transaction.status = 'success';
                    transaction.channel = req.body.data.channel;
                    transaction.paidAt = new Date(data.paid_at);
                    transaction.updatedAt = Date.now();
                    user.walletBalance += (data.amount / 100);
                    await transaction.save();
                    await user.save();
                    log('WALLET FUNDING SUCCESSFUL');
                } else if (transaction.type === 'payout') {
                    // TODO - Save transaction channel
                    log(`PAYING OUT USER: ${user}, REF: ${reference}`);
                    transaction.status = 'success';
                    transaction.paidAt = new Date(data.paid_at);
                    transaction.updatedAt = Date.now();
                    user.walletBalance -= (data.amount / 100);
                    await transaction.save();
                    await user.save();
                    log('PAYOUT SUCCESSFUL');
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

    /**
     * @method chargeCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Payment
     */
    static async chargeCard(req, res) {
        const form = {
            authorization_code: '',
            email: '',
            amount: 5000
        };
        chargeAuth(form, async (err, body) => {
            if (err) {
                log(err);
            } else {
                body = JSON.parse(body);
                res.send(body);
            }
        });
    }

    /**
     * @method initiateAddCard
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Payment
     */
    static async initiateAddCard(req, res, next) {
        const reference = `TX-${Helper.generateUniqueString()}`;
        const { id, role } = req.user;
        try {
            const user = await UserService.findByIdAndRole(id, role);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            const transaction = {
                amount: 50,
                user: id,
                reference,
                // narration: `Card added for ${user.firstName}, email: ${user.email}`,
                type: 'add_card'
            };
            await TransactionService.createTransaction(transaction);
            const form = {
                amount: 5000,
                email: user.email,
                reference,
                full_name: `${user.firstName} ${user.lastName}`
            };
            form.metadata = {
                full_name: `${user.firstName} ${user.lastName}`
            };
            const [err, rsp] = await promiseHandler(initialize(form));
            if (err) {
                log(err);
                return next(new APIError(
                    'unable to process transaction', httpStatus.UNPROCESSABLE_ENTITY, true
                ));
            }
            const result = await rsp.json();
            log(JSON.stringify(result));
            if (!result.status || !result.data) {
                return next(new APIError(
                    'unable to process transaction', httpStatus.UNPROCESSABLE_ENTITY, true
                ));
            }
            req.paymentInfo = {
                reference,
                accessCode: result.data.access_code,
                authorizationUrl: result.data.authorization_url
            };
            return next();
        } catch (error) {
            log(error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method completePayment
     * @description
     * @static
     * @param {object} req - Request object
     * @param {object} res - Response object
     * @param {object} next
     * @returns {object} JSON response
     * @memberof Payment
     */
    static async completePayment(req, res, next) {
        const { reference } = req.query;
        try {
            const transaction = await TransactionService
                .getTransactionByRef(reference);
            if (!transaction) {
                return next(new APIError(
                    messages.txNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            const user = await UserService.findById(transaction.user);
            if (!user) {
                return next(new APIError(
                    messages.userNotFound, httpStatus.NOT_FOUND, true
                ));
            }
            if (transaction.status === 'success') return next();
            if (transaction.status === 'failed') {
                return next(new APIError(
                    messages.paymentFailed, httpStatus.UNPROCESSABLE_ENTITY, true
                ));
            }
            const [err, rsp] = await promiseHandler(verify(reference));
            if (err) {
                return next(new APIError(messages.tnxVerifErr, httpStatus.BAD_GATEWAY, true));
            }
            const result = await rsp.json();
            log(`REQUERY PAYMENT RESPONSE ${JSON.stringify(result)}`);
            if (!(result.status && result.data.status === 'success')) {
                transaction.status = 'failed';
                await transaction.save();
                return next(new APIError(
                    messages.tnxVerifErr, httpStatus.UNPROCESSABLE_ENTITY, true
                ));
            }
            if (transaction.type === 'add_card') {
                const addCard = await Payment.addCard(user, transaction, result.data);
                if (!addCard.isSuccessful) {
                    return next(new APIError(
                        messages.paymentFailed, httpStatus.UNPROCESSABLE_ENTITY, true
                    ));
                }
            } else if (transaction.type === 'fund_wallet') {
                user.walletBalance += transaction.amount;
                await user.save();
            }
            next();
        } catch (error) {
            log('ERROR WHILE COMPLETING PAYMENT', error);
            return next(new APIError(error, httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    /**
     * @method addCard
     * @description
     * @static
     * @param {object} user
     * @param {object} transaction
     * @param {object} data
     * @returns {object} JSON response
     * @memberof Payment
     */
    static async addCard(user, transaction, data) {
        const { authorization, customer, reference } = data;
        log(`ADDING CARD USER: ${user.id}, REF: ${reference}`);
        const [err, rsp] = await promiseHandler(refund({ transaction: reference }));
        if (err) {
            user.walletBalance += 50;
        } else if (rsp) {
            const result = await rsp.json();
            log(`REFUND PAYMENT RESPONSE ${JSON.stringify(result)}`);
            if (!result.status) {
                user.walletBalance += 50;
            }
        }
        // transaction.paidAt = result.data.transaction.paid_at;
        // transaction.channel = result.data.transaction.channel;
        transaction.status = 'success';
        transaction.narration += 'Add card transaction';
        if (!authorization.reusable) {
            transaction.status = 'failed';
            return { isSuccessful: false, message: 'unable to add card' };
        }
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
            bin: authorization.bin,
            signature: authorization.signature,
            bank: authorization.bank,
            countryCode: authorization.country_code,
            accountName: authorization.account_name,
            expMonth: authorization.exp_month,
            expYear: authorization.exp_year,
            suffix: authorization.last4,
            brand: authorization.brand,
            type: authorization.card_type,
            email: customer.email,
            default: true
        };
        log('CARD -------', card);
        let conflictCard;
        const cards = await CardService.getAllDisplayableCards(user.id);
        const defaultCard = await CardService.getDefaultCard(user.id);
        if (defaultCard) {
            defaultCard.default = false;
            await defaultCard.save();
        }
        for (let i = 0; i < cards.length; i += 1) {
            if (cards[i].signature === card.signature) {
                log('ONE EQUAL AM OOOOO');
                conflictCard = cards[i].id;
                break;
            }
        }
        if (conflictCard) await CardService.removeCard(conflictCard);
        await CardService.addCard(card);
        user.addedCard = true;
        await user.save();
        transaction.updatedAt = Date.now();
        await transaction.save();
        log('ADD CARD AND REFUND SUCCESSFUL');
        return { isSuccessful: true };
    }
}
