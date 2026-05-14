const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");
const { Tenant, Order } = require("../../models");
const { Platform } = require("../../models");
const tenantService = require("./tenant.service");

class SuperAdminController {
  // ── Tenants ──────────────────────────────────────────────────────────────

  getAllTenants = asyncHandler(async (req, res) => {
    const tenants = await Tenant.find({}).sort({ createdAt: -1 }).populate("ownerAdminId", "name email");
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tenants));
  });

  getTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findOne({ tenantId: req.params.tenantId }).populate("ownerAdminId", "name email");
    if (!tenant) return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Tenant not found"));
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tenant));
  });

  createTenant = asyncHandler(async (req, res) => {
    const result = await tenantService.createTenant({ ...req.body, immediateActive: true });
    return res.status(httpStatus.CREATED).json(
      new ApiResponse(httpStatus.CREATED, result, "Tenant created successfully")
    );
  });

  updateTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findOneAndUpdate(
      { tenantId: req.params.tenantId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!tenant) return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Tenant not found"));
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tenant, "Tenant updated"));
  });

  toggleTenantStatus = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findOne({ tenantId: req.params.tenantId });
    if (!tenant) return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Tenant not found"));
    tenant.status = tenant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await tenant.save();
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tenant, `Tenant ${tenant.status}`));
  });

  deleteTenant = asyncHandler(async (req, res) => {
    await Tenant.findOneAndDelete({ tenantId: req.params.tenantId });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Tenant deleted"));
  });

  // ── Platform Analytics ────────────────────────────────────────────────────

  getPlatformStats = asyncHandler(async (req, res) => {
    const [totalTenants, activeTenants, totalOrders, totalRevenue] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ status: "ACTIVE" }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]).then(r => r[0]?.total || 0),
    ]);

    // Per-tenant order counts
    const tenantStats = await Order.aggregate([
      { $group: { _id: "$tenantId", orders: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { revenue: -1 } },
    ]);

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, {
      totalTenants, activeTenants, totalOrders, totalRevenue, tenantStats,
    }));
  });

  // ── All orders across tenants ─────────────────────────────────────────────

  getAllOrders = asyncHandler(async (req, res) => {
    const { tenantId, page = 1, limit = 50 } = req.query;
    const filter = tenantId ? { tenantId } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("userId", "name email");
    const total = await Order.countDocuments(filter);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { orders, total, page: Number(page) }));
  });
  // ── Platform Details & Settings ──────────────────────────────────────────

  getPlatformSettings = asyncHandler(async (req, res) => {
    const { Platform } = require("../../models");
    let platform = await Platform.findOne();
    if (!platform) platform = await Platform.create({});
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, platform));
  });

  updatePlatformSettings = asyncHandler(async (req, res) => {
    const { Platform } = require("../../models");
    let platform = await Platform.findOne();
    if (!platform) platform = new Platform();
    
    // update fields
    Object.assign(platform, req.body);
    await platform.save();
    
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, platform, "Platform settings updated"));
  });
}

const controller = new SuperAdminController();
const router = express.Router();

router.get("/tenants",                    controller.getAllTenants);
router.post("/tenants",                   controller.createTenant);
router.get("/tenants/:tenantId",          controller.getTenant);
router.put("/tenants/:tenantId",          controller.updateTenant);
router.patch("/tenants/:tenantId/status", controller.toggleTenantStatus);
router.delete("/tenants/:tenantId",       controller.deleteTenant);
router.get("/stats",                      controller.getPlatformStats);
router.get("/orders",                     controller.getAllOrders);
router.get("/platform",                   controller.getPlatformSettings);
router.put("/platform",                   controller.updatePlatformSettings);

module.exports = { controller, router };
