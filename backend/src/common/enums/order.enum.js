const { ORDER_STATUS, ORDER_TYPE } = require("../constants/order.constant");

const ORDER_STATUS_ENUM = Object.values(ORDER_STATUS);
const ORDER_TYPE_ENUM = Object.values(ORDER_TYPE);

module.exports = { ORDER_STATUS_ENUM, ORDER_TYPE_ENUM };
