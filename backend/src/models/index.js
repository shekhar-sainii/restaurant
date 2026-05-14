const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Order = require("./order.model");
const Payment = require("./payment.model");
const Table = require("./table.model");
const OTP = require("./otp.model");
const Message = require("./message.model");
const Tenant = require("./tenant.model");
const Platform = require("./platform.model");

module.exports = {
  User, Category, Product, Order, Payment, Table, OTP, Message, Tenant, Platform
};
