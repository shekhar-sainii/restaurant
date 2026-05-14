const QRCode = require("qrcode");
const config = require("../../config/env.config");
const paymentRepository = require("./payment.repository");
const orderRepository = require("../order/order.repository");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("../../utils/httpStatus");

class PaymentService {
  /**
   * Build UPI deep link string
   * Standard UPI URL format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&tn=NOTE&cu=INR
   */
  buildUpiDeepLink({ upiId, amount, orderId, merchantName }) {
    const note = encodeURIComponent(`Pizza Kings Order ${orderId}`);
    const name = encodeURIComponent(merchantName);
    return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&tn=${note}&cu=INR`;
  }

  /**
   * Initiate UPI payment — create pending payment record + return QR data
   */
  async initiateUpiPayment({ orderId, userId, upiId }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");

    const selectedUpiId = upiId === "secondary"
      ? config.upi.secondaryId
      : config.upi.primaryId;

    const deepLink = this.buildUpiDeepLink({
      upiId: selectedUpiId,
      amount: order.totalAmount,
      orderId: order.orderNumber,
      merchantName: config.upi.merchantName,
    });

    // Generate QR as base64 data URL
    const qrDataUrl = await QRCode.toDataURL(deepLink, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // Create pending payment record
    const payment = await paymentRepository.create({
      orderId: order._id,
      userId: userId || null,
      amount: order.totalAmount,
      method: "UPI",
      upiId: selectedUpiId,
      upiDeepLink: deepLink,
      status: "CREATED",
    });

    return {
      paymentId: payment._id,
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      upiId: selectedUpiId,
      deepLink,
      qrDataUrl,
    };
  }

  /**
   * Verify UTR submitted by user — mark payment SUCCESS and order paymentStatus PAID
   */
  async verifyUtrPayment({ paymentId, utrNumber }) {
    if (!utrNumber || utrNumber.trim().length < 6) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Please enter a valid UTR / Transaction ID");
    }

    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(httpStatus.NOT_FOUND, "Payment record not found");

    if (payment.status === "SUCCESS") {
      throw new ApiError(httpStatus.CONFLICT, "Payment already verified");
    }

    // Mark payment as success with UTR
    const updatedPayment = await paymentRepository.updateById(payment._id, {
      status: "SUCCESS",
      utrNumber: utrNumber.trim(),
    });

    // Update order: paymentStatus → PAID, link paymentId, flip to RECEIVED
    await orderRepository.updateById(payment.orderId, {
      paymentStatus: "PAID",
      paymentId: payment._id,
      paymentMethod: "UPI",
      orderStatus: "RECEIVED",
    });

    // Emit socket event so admin sees it live
    const socketManager = require("../../sockets/socketManager");
    const order = await orderRepository.findById(payment.orderId);
    socketManager.emit("order:updated", order);

    return { payment: updatedPayment, order };
  }
}

module.exports = new PaymentService();
