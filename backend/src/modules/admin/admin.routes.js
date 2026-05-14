const express = require("express");
const { verifyAccessToken, requireRole } = require("../../middlewares");
const ROLES = require("../../common/constants/roles.constant");

const router = express.Router();

// Apply base verification
router.use(verifyAccessToken);

// Mount admin-specific routes with granular role protection
router.use("/dashboard", requireRole(ROLES.ADMIN, ROLES.KITCHEN, ROLES.DELIVERY), require("./dashboard/dashboard.controller").router);
router.use("/order-mgmt", requireRole(ROLES.ADMIN, ROLES.KITCHEN, ROLES.DELIVERY), require("./order-mgmt/order.admin.controller").router);

// Management routes restricted to ADMIN
router.use("/product-mgmt", requireRole(ROLES.ADMIN), require("./product-mgmt/product.admin.controller").router);
router.use("/category-mgmt", requireRole(ROLES.ADMIN), require("./category-mgmt/category.admin.controller").router);
router.use("/table-mgmt", requireRole(ROLES.ADMIN), require("./table-mgmt/table.admin.controller").router);
router.use("/payment-mgmt", requireRole(ROLES.ADMIN), require("./payment-mgmt/payment.admin.controller").router);
router.use("/user-mgmt", requireRole(ROLES.ADMIN), require("./user-mgmt/user.admin.controller").router);
router.use("/staff-mgmt", requireRole(ROLES.ADMIN), require("./staff-mgmt/staff.admin.controller").router);
router.use("/branding",   requireRole(ROLES.ADMIN), require("./branding/branding.admin.controller").router);

module.exports = router;
