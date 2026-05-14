const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");
const emailService = require("../../../emails/email.service");

const router = express.Router();

class OrderAdminController {
  getAllOrders = asyncHandler(async (req, res) => {
    const Order = req.db.model("Order");
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email mobile")
      .populate("items.productId", "name image");
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, orders));
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const Order = req.db.model("Order");
    const Table = req.db.model("Table");

    const existing = await Order.findById(id);
    if (req.tenantId && existing?.tenantId !== req.tenantId) {
      return res.status(httpStatus.FORBIDDEN).json(new ApiResponse(httpStatus.FORBIDDEN, null, "Access denied"));
    }

    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    const socketManager = require("../../../sockets/socketManager");

    if (status === "CANCELLED" && (order.orderType === "DINING" || order.orderType === "DINE_IN") && order.tableNumber) {
      const updatedTable = await Table.findOneAndUpdate(
        { tableNumber: Number(order.tableNumber), ...(req.tenantId ? { tenantId: req.tenantId } : {}) },
        { status: "AVAILABLE", activeOrderId: null },
        { new: true }
      );
      if (updatedTable) socketManager.emit("table:updated", updatedTable);
    }

    socketManager.emit("order:updated", order);

    if ((status === "DELIVERED" || status === "SERVED") && order.userId) {
      const User = req.db.model("User");
      User.findById(order.userId).then(user => {
        if (user?.email) emailService.sendOrderDelivered(user, order).catch(() => {});
      }).catch(() => {});
    }

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, order, "Order status updated"));
  });

  updatePaymentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const Order = req.db.model("Order");

    const allowed = ["PAID", "PENDING", "FAILED"];
    if (!allowed.includes(paymentStatus)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        new ApiResponse(httpStatus.BAD_REQUEST, null, `paymentStatus must be one of: ${allowed.join(", ")}`)
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Order not found"));
    }
    if (req.tenantId && order.tenantId !== req.tenantId) {
      return res.status(httpStatus.FORBIDDEN).json(new ApiResponse(httpStatus.FORBIDDEN, null, "Access denied"));
    }

    const updateData = { paymentStatus };
    if (!order.paymentMethod && paymentStatus === "PAID") updateData.paymentMethod = "CASH";

    const updated = await Order.findByIdAndUpdate(id, updateData, { new: true });
    const socketManager = require("../../../sockets/socketManager");
    socketManager.emit("order:updated", updated);

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, updated, "Payment status updated"));
  });
}

const controller = new OrderAdminController();
router.get("/",                     controller.getAllOrders);
router.patch("/:id/status",         controller.updateStatus);
router.patch("/:id/payment-status", controller.updatePaymentStatus);

module.exports = { controller, router };
