const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");
const orderRepository = require("../../order/order.repository");

const router = express.Router();

class PaymentAdminController {
  getAllPayments = asyncHandler(async (req, res) => {
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const orders = await orderRepository.find(filter, {
      sort: { createdAt: -1 },
      populate: [
        { path: "userId", select: "name email mobile" },
        { path: "paymentId" },
      ],
    });

    const paymentRepository = require("../../payment/payment.repository");
    const enriched = await Promise.all(orders.map(async (order) => {
      const obj = order.toObject ? order.toObject() : { ...order };
      if (!obj.paymentMethod && obj.paymentId) {
        obj.paymentMethod = obj.paymentId.method || null;
      }
      if (!obj.paymentMethod) {
        const paymentRecord = await paymentRepository.findOne({ orderId: obj._id });
        if (paymentRecord) {
          obj.paymentMethod = paymentRecord.method;
          obj._paymentRecord = paymentRecord;
        }
      }
      return obj;
    }));

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, enriched));
  });

  updatePaymentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const allowed = ["PAID", "PENDING", "FAILED"];
    if (!allowed.includes(paymentStatus)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        new ApiResponse(httpStatus.BAD_REQUEST, null, `paymentStatus must be one of: ${allowed.join(", ")}`)
      );
    }

    const order = await orderRepository.findById(id);
    if (!order) {
      return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Order not found"));
    }

    // Tenant isolation check
    if (req.tenantId && order.tenantId !== req.tenantId) {
      return res.status(httpStatus.FORBIDDEN).json(new ApiResponse(httpStatus.FORBIDDEN, null, "Access denied"));
    }

    const updateData = { paymentStatus };
    if (!order.paymentMethod && paymentStatus === "PAID") {
      updateData.paymentMethod = "CASH";
    }

    const updated = await orderRepository.updateById(id, updateData);
    const socketManager = require("../../../sockets/socketManager");
    socketManager.emit("order:updated", updated);

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, updated, "Payment status updated"));
  });
}

const controller = new PaymentAdminController();
router.get("/",                      controller.getAllPayments);
router.patch("/:id/payment-status",  controller.updatePaymentStatus);

module.exports = { controller, router };
