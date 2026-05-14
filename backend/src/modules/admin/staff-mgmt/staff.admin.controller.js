const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");
const { User } = require("../../../models");
const orderRepository = require("../../order/order.repository");

const router = express.Router();

class StaffAdminController {
  /**
   * GET /admin/staff-mgmt
   * All KITCHEN + DELIVERY staff with monthly order stats
   */
  getStaff = asyncHandler(async (req, res) => {
    const filter = req.tenantId
      ? { role: { $in: ["KITCHEN", "DELIVERY"] }, tenantId: req.tenantId }
      : { role: { $in: ["KITCHEN", "DELIVERY"] } };
    const staff = await User.find(filter).sort({ createdAt: -1 });

    // Monthly range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // For each staff member, count orders they handled this month
    // We track by checking orders updated in this period
    // Since we don't have a staffId on orders, we compute aggregate stats globally
    // and attach per-role breakdowns
    const [
      totalDeliveredThisMonth,
      totalRevenueThisMonth,
      kitchenOrdersThisMonth,
    ] = await Promise.all([
      orderRepository.count({
        orderStatus: 'DELIVERED',
        updatedAt: { $gte: monthStart, $lte: monthEnd },
      }),
      orderRepository.find({
        paymentStatus: 'PAID',
        updatedAt: { $gte: monthStart, $lte: monthEnd },
      }).then(orders => orders.reduce((s, o) => s + (o.totalAmount || 0), 0)),
      orderRepository.count({
        orderStatus: { $in: ['PREPARING', 'READY', 'DELIVERED'] },
        updatedAt: { $gte: monthStart, $lte: monthEnd },
      }),
    ]);

    const enriched = staff.map(s => {
      const obj = s.toObject();
      // Attach role-relevant stats
      obj.monthlyStats = {
        ordersHandled: s.role === 'DELIVERY' ? totalDeliveredThisMonth : kitchenOrdersThisMonth,
        revenueGenerated: s.role === 'DELIVERY' ? totalRevenueThisMonth : null,
        month: now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      };
      return obj;
    });

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, enriched));
  });

  /**
   * POST /admin/staff-mgmt
   * Create a new staff account
   */
  createStaff = asyncHandler(async (req, res) => {
    const { name, email, mobile, password, role } = req.body;

    if (!['KITCHEN', 'DELIVERY'].includes(role)) {
      return res.status(httpStatus.BAD_REQUEST).json(
        new ApiResponse(httpStatus.BAD_REQUEST, null, 'Role must be KITCHEN or DELIVERY')
      );
    }

    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing) {
      return res.status(httpStatus.CONFLICT).json(
        new ApiResponse(httpStatus.CONFLICT, null, 'Email or mobile already registered')
      );
    }

    const staff = await User.create({ name, email, mobile, password, role,
      tenantId: req.tenantId || null });
    return res.status(httpStatus.CREATED).json(
      new ApiResponse(httpStatus.CREATED, staff, 'Staff account created')
    );
  });

  /**
   * PATCH /admin/staff-mgmt/:id/status — toggle active
   */
  toggleStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, 'Not found'));
    user.isActive = !user.isActive;
    await user.save();
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, user, 'Status updated'));
  });

  /**
   * DELETE /admin/staff-mgmt/:id
   */
  deleteStaff = asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, 'Staff removed'));
  });
}

const controller = new StaffAdminController();
router.get('/',           controller.getStaff);
router.post('/',          controller.createStaff);
router.patch('/:id/status', controller.toggleStatus);
router.delete('/:id',     controller.deleteStaff);

module.exports = { controller, router };
