/**
 * SaaS Migration Script
 * Run once: node src/scripts/migrate-to-saas.js
 *
 * - Creates the default "Pizza Kings" tenant (tenant_001)
 * - Stamps tenantId on all existing documents
 * - Creates SUPER_ADMIN account
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TENANT_ID = "restaurant_001";
const SLUG      = "pizzakings";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const { User, Category, Product, Order, Payment, Table, Tenant } = require("../models");

  // 1. Create tenant if not exists
  let tenant = await Tenant.findOne({ tenantId: TENANT_ID });
  if (!tenant) {
    // Find existing admin user to set as owner
    const adminUser = await User.findOne({ role: "ADMIN" });

    tenant = await Tenant.create({
      tenantId: TENANT_ID,
      slug: SLUG,
      businessName: "Pizza Kings",
      businessType: "RESTAURANT",
      ownerAdminId: adminUser?._id || null,
      status: "ACTIVE",
      paymentSettings: {
        cashEnabled: true,
        upiEnabled: true,
        upiIdPrimary: process.env.UPI_ID_PRIMARY || "shivanshsaini733@oksbi",
        upiIdSecondary: process.env.UPI_ID_SECONDARY || "9520640928@okbizaxis",
        upiMerchantName: "Pizza Kings",
      },
      enabledModules: {
        dineIn: true, delivery: true, tableOrdering: true,
        qrOrdering: true, combos: false, weightPricing: false,
        chat: true, staffMgmt: true,
      },
      subscriptionPlan: "FREE",
    });
    console.log(`✅ Tenant created: ${TENANT_ID}`);
  } else {
    console.log(`ℹ️  Tenant already exists: ${TENANT_ID}`);
  }

  // 2. Stamp tenantId on all existing documents
  const collections = [
    { model: Category, name: "categories" },
    { model: Product,  name: "products"   },
    { model: Order,    name: "orders"      },
    { model: Payment,  name: "payments"    },
    { model: Table,    name: "tables"      },
  ];

  for (const { model, name } of collections) {
    const result = await model.updateMany(
      { tenantId: { $exists: false } },
      { $set: { tenantId: TENANT_ID } }
    );
    console.log(`✅ ${name}: stamped ${result.modifiedCount} documents`);
  }

  // 3. Stamp tenantId on non-SUPER_ADMIN users
  const userResult = await User.updateMany(
    { tenantId: { $exists: false }, role: { $ne: "SUPER_ADMIN" } },
    { $set: { tenantId: TENANT_ID } }
  );
  console.log(`✅ users: stamped ${userResult.modifiedCount} documents`);

  // 4. Create SUPER_ADMIN if not exists
  const existingSA = await User.findOne({ role: "SUPER_ADMIN" });
  if (!existingSA) {
    const pwd = await bcrypt.hash("SuperAdmin@123", 10);
    await User.create({
      name: "Super Admin",
      email: "superadmin@pizzakings.com",
      password: pwd,
      role: "SUPER_ADMIN",
      tenantId: null,
    });
    console.log("✅ SUPER_ADMIN created: superadmin@pizzakings.com / SuperAdmin@123");
    console.log("⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN");
  } else {
    console.log("ℹ️  SUPER_ADMIN already exists");
  }

  console.log("\n🎉 Migration complete!");
  await mongoose.disconnect();
}

run().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
