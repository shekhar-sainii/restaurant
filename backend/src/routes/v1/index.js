const express = require("express");
const authRoutes    = require("../../modules/auth/auth.routes");
const categoryRoutes= require("../../modules/category/category.routes");
const productRoutes = require("../../modules/product/product.routes");
const orderRoutes   = require("../../modules/order/order.routes");
const paymentRoutes = require("../../modules/payment/payment.routes");
const tableRoutes   = require("../../modules/table/table.routes");
const userRoutes    = require("../../modules/user/user.routes");
const adminRoutes   = require("../../modules/admin/admin.routes");
const superAdminRoutes = require("../../modules/super-admin/super-admin.controller");
const publicRoutes  = require("./public.routes");
const healthRoutes  = require("./health.routes");
const { verifyAccessToken, requireRole, resolveTenant, resolveTenantSoft } = require("../../middlewares");

const router = express.Router();

// Health — no auth
router.use("/health", healthRoutes);

// Auth — no DB connection needed, just resolve tenantId from header
router.use("/auth", (req, res, next) => {
  // Set tenantId from header/query without connecting to tenant DB
  req.tenantId = req.headers["x-tenant-slug"] || req.query.tenant || null;
  req.db = require("mongoose").connection; // always use master for auth
  next();
}, authRoutes);

// Public storefront — tenant required
router.use("/public", resolveTenantSoft, publicRoutes);

// Tenant-scoped routes — require tenant resolution
router.use("/categories", verifyAccessToken, resolveTenant, categoryRoutes);
router.use("/products",   verifyAccessToken, resolveTenant, productRoutes);
router.use("/orders",     resolveTenantSoft, orderRoutes);
router.use("/payments",   resolveTenantSoft, paymentRoutes);
router.use("/tables",     resolveTenantSoft, tableRoutes);
router.use("/user",       verifyAccessToken, userRoutes);

// Tenant admin panel — requires auth + tenant
router.use("/admin", verifyAccessToken, resolveTenant, adminRoutes);

// Super admin — requires SUPER_ADMIN role, no tenant needed
router.use(
  "/super-admin",
  verifyAccessToken,
  requireRole("SUPER_ADMIN"),
  superAdminRoutes.router
);

module.exports = router;
