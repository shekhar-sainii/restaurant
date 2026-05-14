const mongoose = require("mongoose");
const { ORDER_STATUS_ENUM, ORDER_TYPE_ENUM } = require("../common/enums/order.enum");
const { PAYMENT_METHOD_ENUM, PAYMENT_STATUS_ENUM } = require("../common/enums/payment.enum");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  discountedPrice: Number,
  qty: { type: Number, min: 1 },
  image: String,
  isVeg: Boolean,
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestName: String,
    guestMobile: String,
    orderType: {
      type: String,
      enum: ORDER_TYPE_ENUM,
      required: true,
    },
    tableNumber: Number,
    deliveryAddress: {
      line1: String,
      city: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    items: [orderItemSchema],
    subtotal: Number,
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: Number,
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_ENUM,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_ENUM,
      default: "PENDING",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUS_ENUM,
      default: "RECEIVED",
    },
    cancelReason: String,
    specialInstructions: String,
  },
  { timestamps: true }
);


orderSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, orderType: 1, orderStatus: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, tableNumber: 1, orderStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
