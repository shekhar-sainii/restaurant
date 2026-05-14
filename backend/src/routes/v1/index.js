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
const { verifyAccessToken, requireRole, resolveTenant, resolveTenantSoft, rateLimiter, checkoutRateLimiter } = require("../../middlewares");

const router = express.Router();

// Apply standard global API protection limiter
router.use(rateLimiter);

// Health — no auth
router.use("/health", healthRoutes);

// Auth — protected with stricter fraud/abuse rate limits
router.use("/auth", checkoutRateLimiter, (req, res, next) => {
  req.tenantId = req.headers["x-tenant-slug"] || req.query.tenant || null;
  req.db = require("mongoose").connection; 
  next();
}, authRoutes);

// Public storefront — tenant required
router.use("/public", resolveTenantSoft, publicRoutes);

// Tenant-scoped routes — require tenant resolution
router.use("/categories", verifyAccessToken, resolveTenant, categoryRoutes);
router.use("/products",   verifyAccessToken, resolveTenant, productRoutes);
router.use("/orders",     checkoutRateLimiter, resolveTenantSoft, orderRoutes);
router.use("/payments",   checkoutRateLimiter, resolveTenantSoft, paymentRoutes);
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
