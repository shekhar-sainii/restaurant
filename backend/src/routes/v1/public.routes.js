const express = require("express");
const categoryController = require("../../modules/category/category.controller");
const productController = require("../../modules/product/product.controller");
const tableController = require("../../modules/table/table.controller");
const { Tenant } = require("../../models");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

// List all active tenants (for landing page)
router.get("/tenants", asyncHandler(async (req, res) => {
  const tenants = await Tenant.find({ status: "ACTIVE" })
    .select("tenantId slug businessName businessType theme logo")
    .sort({ createdAt: 1 });
  return res.json(new ApiResponse(200, tenants));
}));

// Tenant config by slug (for storefront init)
router.get("/tenants/:slug/config", asyncHandler(async (req, res) => {
  const tenant = await Tenant.findOne({ slug: req.params.slug, status: "ACTIVE" })
    .select("-dbUri -ownerAdminId");
  if (!tenant) return res.status(404).json(new ApiResponse(404, null, "Tenant not found"));
  return res.json(new ApiResponse(200, tenant));
}));

// Restaurant self-registration (public)
router.post("/restaurants/register", asyncHandler(async (req, res) => {
  const {
    restaurantName, slug, adminName, adminEmail, adminPassword, adminMobile,
    address, contactPhone,
  } = req.body;

  if (!restaurantName || !slug || !adminEmail || !adminPassword || !adminName) {
    return res.status(400).json(new ApiResponse(400, null, "restaurantName, slug, adminName, adminEmail, adminPassword are required"));
  }

  // Check slug uniqueness
  const existing = await Tenant.findOne({ $or: [{ slug }, { tenantId: slug }] });
  if (existing) {
    return res.status(409).json(new ApiResponse(409, null, "Restaurant slug already taken. Please choose another."));
  }

  // Check admin email uniqueness
  const { User } = require("../../models");
  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    return res.status(409).json(new ApiResponse(409, null, "Email already registered"));
  }

  const bcrypt = require("bcryptjs");
  const mongoose = require("mongoose");
  const config = require("../../config/env.config");

  const tenantId = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  const MONGO_BASE = config.mongoose.url.replace(/\/[^/]+$/, "");
  const dbUri = `${MONGO_BASE}/tenant_${tenantId}`;

  // Create admin user
  const hashed = await bcrypt.hash(adminPassword, 10);
  const adminUser = await User.create({
    tenantId, name: adminName, email: adminEmail,
    mobile: adminMobile || null, password: hashed, role: "ADMIN",
  });

  // Create tenant (pending approval or auto-active)
  const tenant = await Tenant.create({
    tenantId, slug, businessName: restaurantName,
    businessType: "RESTAURANT",
    ownerAdminId: adminUser._id,
    status: "ACTIVE", // auto-approve; change to INACTIVE for manual approval
    dbMode: "DEDICATED", dbUri,
    theme: { primaryColor: "#c9a227", backgroundColor: "#0f0f0f", fontFamily: "Playfair Display" },
    paymentSettings: { cashEnabled: true, upiEnabled: false },
    enabledModules: { dineIn: true, delivery: true, tableOrdering: true, qrOrdering: true, guestOrdering: true, chat: true, staffMgmt: true },
    subscriptionPlan: "FREE",
    contactEmail: adminEmail, contactPhone: contactPhone || adminMobile,
    address: address || null,
  });

  return res.status(201).json(new ApiResponse(201, {
    tenantId: tenant.tenantId,
    slug: tenant.slug,
    businessName: tenant.businessName,
    adminEmail,
    storefrontUrl: `/${tenant.slug}`,
    adminPanelUrl: `/admin/dashboard`,
  }, "Restaurant registered successfully! You can now login."));
}));

// Global platform settings
router.get("/platform", asyncHandler(async (req, res) => {
  const { Platform } = require("../../models");
  let platform = await Platform.findOne();
  if (!platform) {
    platform = await Platform.create({}); // auto-create if missing
  }
  return res.json(new ApiResponse(200, platform));
}));

router.get("/categories", categoryController.getCategories);
router.get("/products", productController.getProducts);
router.get("/tables/:tableNumber", tableController.getTable);

// Platform settings (public read — for home page)
router.get("/platform", asyncHandler(async (req, res) => {
  const { Platform } = require("../../models");
  let platform = await Platform.findOne({ key: "main" });
  if (!platform) platform = await Platform.create({ key: "main" });
  return res.json(new ApiResponse(200, platform));
}));

module.exports = router;
