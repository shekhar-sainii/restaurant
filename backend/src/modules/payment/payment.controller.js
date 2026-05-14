const paymentService = require("./payment.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

class PaymentController {
  /**
   * POST /api/v1/payments/upi/initiate
   * Body: { orderId, upiId? ("primary" | "secondary") }
   */
  initiateUpi = asyncHandler(async (req, res) => {
    const { orderId, upiId } = req.body;
    const userId = req.user?._id || null;
    const data = await paymentService.initiateUpiPayment({ orderId, userId, upiId });
    return res.status(httpStatus.CREATED).json(
      new ApiResponse(httpStatus.CREATED, data, "UPI payment initiated")
    );
  });

  /**
   * POST /api/v1/payments/upi/verify
   * Body: { paymentId, utrNumber }
   */
  verifyUtr = asyncHandler(async (req, res) => {
    const { paymentId, utrNumber } = req.body;
    const data = await paymentService.verifyUtrPayment({ paymentId, utrNumber });
    return res.status(httpStatus.OK).json(
      new ApiResponse(httpStatus.OK, data, "Payment verified successfully")
    );
  });
}

module.exports = new PaymentController();
