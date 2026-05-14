const mongoose = require("mongoose");
const { PAYMENT_METHOD_ENUM, PAYMENT_STATUS_ENUM } = require("../common/enums/payment.enum");

const paymentSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    method: {
      type: String,
      enum: PAYMENT_METHOD_ENUM,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ["CREATED", "SUCCESS", "FAILED", "REFUNDED"],
      default: "CREATED",
    },
    failureReason: String,
    refundId: String,
    utrNumber: String,       // UPI Transaction Reference
    upiId: String,           // UPI ID used for payment
    upiDeepLink: String,     // Generated UPI deep link
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
