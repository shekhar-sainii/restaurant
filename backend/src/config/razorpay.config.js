const Razorpay = require("razorpay");
const config = require("./env.config");

const razorpayInstance = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

module.exports = razorpayInstance;
