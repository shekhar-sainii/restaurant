const { PAYMENT_METHOD, PAYMENT_STATUS } = require("../constants/payment.constant");

const PAYMENT_METHOD_ENUM = Object.values(PAYMENT_METHOD);
const PAYMENT_STATUS_ENUM = Object.values(PAYMENT_STATUS);

module.exports = { PAYMENT_METHOD_ENUM, PAYMENT_STATUS_ENUM };
