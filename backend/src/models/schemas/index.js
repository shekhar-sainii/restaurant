/**
 * Mongoose Schemas — exported separately from models.
 * Schemas are reusable across multiple connections.
 * Models are connection-specific (registered per tenant DB).
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const ROLES    = require("../../common/constants/roles.constant");
const TABLE_STATUS = require("../../common/constants/table.constant");
const { ORDER_STATUS_ENUM, ORDER_TYPE_ENUM } = require("../../common/enums/order.enum");
const { PAYMENT_METHOD_ENUM, PAYMENT_STATUS_ENUM } = require("../../common/enums/payment.enum");

// ── User ─────────────────────────────────────────────────────────────────────
const addressSchema = new mongoose.Schema({
  label: String, line1: String, city: String, pincode: String, lat: Number, lng: Number,
});

const userSchema = new mongoose.Schema({
  tenantId:     { type: String, default: null, index: true },
  name:         { type: String, required: true, trim: true },
  email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  mobile:       { type: String, unique: true, sparse: true, trim: true },
  password:     { type: String, select: false },
  googleId:     { type: String, unique: true, sparse: true },
  role:         { type: String, enum: Object.values(ROLES), default: ROLES.USER },
  addresses:    [addressSchema],
  refreshToken: { type: String, select: false },
  isActive:     { type: Boolean, default: true },
  image:        { type: String, default: null },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ── Category ─────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  tenantId:  { type: String, index: true },
  name:      { type: String, required: true, trim: true },
  slug:      { type: String, required: true, lowercase: true },
  image:     String,
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });
categorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
categorySchema.index({ tenantId: 1, isActive: 1, sortOrder: 1 });

// ── Product ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  tenantId:       { type: String, index: true },
  name:           { type: String, required: true, trim: true },
  description:    String,
  price:          { type: Number, required: true },
  discountedPrice: Number,
  categoryId:     { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  image:          String,
  isVeg:          { type: Boolean, default: true },
  hasVariations:  { type: Boolean, default: false },
  variations:     [{ name: { type: String, required: true }, price: { type: Number, required: true }, discountedPrice: Number }],
  dayWisePricing: [{ day: { type: Number, min: 0, max: 6 }, discountPercentage: { type: Number, min: 0, max: 100 }, specialPrice: Number }],
  isAvailable:    { type: Boolean, default: true },
  tags:           [String],
  sortOrder:      { type: Number, default: 0 },
}, { timestamps: true });
productSchema.index({ tenantId: 1, categoryId: 1, isAvailable: 1 });
productSchema.index({ tenantId: 1, isAvailable: 1, sortOrder: 1 });

// ── Table ─────────────────────────────────────────────────────────────────────
const tableSchema = new mongoose.Schema({
  tenantId:     { type: String, index: true },
  tableNumber:  { type: Number, required: true },
  capacity:     { type: Number, default: 4 },
  qrCode:       String,
  qrUrl:        String,
  status:       { type: String, enum: Object.values(TABLE_STATUS), default: TABLE_STATUS.AVAILABLE },
  activeOrderId:{ type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
}, { timestamps: true });
tableSchema.index({ tenantId: 1, status: 1 });
tableSchema.index({ tenantId: 1, tableNumber: 1 }, { unique: true });

// ── Order ─────────────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  productId:      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String, price: Number, discountedPrice: Number,
  qty: { type: Number, min: 1 }, image: String, isVeg: Boolean,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  tenantId:            { type: String, index: true },
  orderNumber:         { type: String, unique: true, required: true },
  userId:              { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  guestName:           String,
  guestMobile:         String,
  orderType:           { type: String, enum: ORDER_TYPE_ENUM, required: true },
  tableNumber:         Number,
  deliveryAddress:     { line1: String, city: String, pincode: String, lat: Number, lng: Number },
  items:               [orderItemSchema],
  subtotal:            Number,
  discount:            { type: Number, default: 0 },
  deliveryCharge:      { type: Number, default: 0 },
  totalAmount:         Number,
  paymentMethod:       { type: String, enum: PAYMENT_METHOD_ENUM },
  paymentStatus:       { type: String, enum: PAYMENT_STATUS_ENUM, default: "PENDING" },
  paymentId:           { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  orderStatus:         { type: String, enum: ORDER_STATUS_ENUM, default: "RECEIVED" },
  cancelReason:        String,
  specialInstructions: String,
}, { timestamps: true });
orderSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, orderType: 1, orderStatus: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, tableNumber: 1, orderStatus: 1 });

// ── Payment ───────────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  tenantId:           { type: String, index: true },
  orderId:            { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  amount:             { type: Number, required: true },
  currency:           { type: String, default: "INR" },
  method:             { type: String, enum: PAYMENT_METHOD_ENUM },
  razorpayOrderId:    String,
  razorpayPaymentId:  String,
  razorpaySignature:  String,
  status:             { type: String, enum: ["CREATED", "SUCCESS", "FAILED", "REFUNDED"], default: "CREATED" },
  failureReason:      String,
  refundId:           String,
  utrNumber:          String,
  upiId:              String,
  upiDeepLink:        String,
}, { timestamps: true });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

// ── OTP ───────────────────────────────────────────────────────────────────────
const otpSchema = new mongoose.Schema({
  tenantId: { type: String, default: null, index: true },
  mobile:   { type: String, required: true },
  otp:      { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt:{ type: Date, default: Date.now, expires: 600 },
}, { timestamps: true });

// ── Message ───────────────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  tenantId:   { type: String, required: true, index: true },
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  text:       { type: String, required: true, trim: true, maxlength: 1000 },
  room:       { type: String, default: "staff" },
}, { timestamps: true });
messageSchema.index({ tenantId: 1, room: 1, createdAt: -1 });

module.exports = {
  User:     userSchema,
  Category: categorySchema,
  Product:  productSchema,
  Table:    tableSchema,
  Order:    orderSchema,
  Payment:  paymentSchema,
  OTP:      otpSchema,
  Message:  messageSchema,
};
