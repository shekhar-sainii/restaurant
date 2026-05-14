const orderService = require("./order.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

class OrderController {
  createOrder = asyncHandler(async (req, res) => {
    const orderData = { ...req.body, userId: req.user?._id, tenantId: req.tenantId };
    const order = await orderService.createOrder(req.db, orderData);
    return res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, order, "Order placed successfully"));
  });

  getOrder = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.db, req.params.id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, order));
  });

  getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getUserOrders(req.db, req.user._id, req.tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, orders));
  });

  getGuestOrders = asyncHandler(async (req, res) => {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, []));
    }
    const orders = await orderService.getOrdersByIds(req.db, orderIds, req.tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, orders));
  });
}

module.exports = new OrderController();
