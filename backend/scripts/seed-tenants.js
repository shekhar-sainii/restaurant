/**
 * Seed Script — Creates 2 test tenants: Pizza Kings + Honey Hub
 * Run: node backend/scripts/seed-tenants.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const TENANTS = [
  {
    tenant: {
      tenantId: "pizzakings",
      slug: "pizzakings",
      businessName: "Pizza Kings",
      businessType: "RESTAURANT",
      status: "ACTIVE",
      dbMode: "SHARED",
      theme: { primaryColor: "#c9a227", backgroundColor: "#0f0f0f", fontFamily: "Playfair Display" },
      paymentSettings: {
        cashEnabled: true, upiEnabled: true,
        upiIdPrimary: "shivanshsaini733@oksbi",
        upiIdSecondary: "9520640928@okbizaxis",
        upiMerchantName: "Pizza Kings",
        razorpayEnabled: false,
      },
      enabledModules: {
        dineIn: true, delivery: true, tableOrdering: true,
        qrOrdering: true, combos: false, weightPricing: false,
        chat: true, staffMgmt: true,
      },
      subscriptionPlan: "FREE",
      contactEmail: "admin@pizzakings.com",
      address: "Behat, Saharanpur, UP",
    },
    admin: {
      name: "Pizza Kings Admin",
      email: "admin@pizzakings.com",
      mobile: "9000000001",
      password: "Admin@123",
      role: "ADMIN",
    },
  },
  {
    tenant: {
      tenantId: "honeyhub",
      slug: "honeyhub",
      businessName: "Honey Hub",
      businessType: "HONEY_STORE",
      status: "ACTIVE",
      dbMode: "SHARED",
      theme: { primaryColor: "#f59e0b", backgroundColor: "#0f0a00", fontFamily: "Inter" },
      paymentSettings: {
        cashEnabled: true, upiEnabled: true,
        upiIdPrimary: "honeyhub@upi",
        upiIdSecondary: null,
        upiMerchantName: "Honey Hub",
        razorpayEnabled: false,
      },
      enabledModules: {
        dineIn: false, delivery: true, tableOrdering: false,
        qrOrdering: false, combos: false, weightPricing: true,
        chat: true, staffMgmt: true,
      },
      subscriptionPlan: "STARTER",
      contactEmail: "admin@honeyhub.com",
      address: "Delhi, India",
    },
    admin: {
      name: "Honey Hub Admin",
      email: "admin@honeyhub.com",
      mobile: "9000000002",
      password: "Admin@123",
      role: "ADMIN",
    },
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const tenantsColl = db.collection("tenants");
  const usersColl   = db.collection("users");

  for (const { tenant, admin } of TENANTS) {
    // Upsert tenant
    const existing = await tenantsColl.findOne({ tenantId: tenant.tenantId });
    if (existing) {
      console.log(`ℹ️  Tenant '${tenant.tenantId}' already exists — skipping`);
    } else {
      // Create admin user first
      const existingAdmin = await usersColl.findOne({ email: admin.email });
      let adminId;

      if (existingAdmin) {
        adminId = existingAdmin._id;
        console.log(`ℹ️  Admin '${admin.email}' already exists`);
      } else {
        const hashed = await bcrypt.hash(admin.password, 10);
        const result = await usersColl.insertOne({
          tenantId: tenant.tenantId,
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          password: hashed,
          role: admin.role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        adminId = result.insertedId;
        console.log(`✅ Created admin: ${admin.email} / ${admin.password}`);
      }

      await tenantsColl.insertOne({
        ...tenant,
        ownerAdminId: adminId,
        dbUri: null,
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Created tenant: ${tenant.businessName} (/${tenant.slug})`);
    }
  }

  // Migrate existing data without tenantId to pizzakings
  const collections = ["orders", "products", "categories", "tables", "payments"];
  for (const col of collections) {
    const r = await db.collection(col).updateMany(
      { tenantId: { $in: [null, undefined, ""] } },
      { $set: { tenantId: "pizzakings" } }
    );
    if (r.modifiedCount > 0)
      console.log(`✅ Migrated ${r.modifiedCount} ${col} → pizzakings`);
  }

  // Migrate existing users (non-super-admin) without tenantId
  const ur = await usersColl.updateMany(
    { tenantId: { $in: [null, undefined, ""] }, role: { $ne: "SUPER_ADMIN" } },
    { $set: { tenantId: "pizzakings" } }
  );
  if (ur.modifiedCount > 0)
    console.log(`✅ Migrated ${ur.modifiedCount} users → pizzakings`);

  console.log("\n🎉 Seed complete!\n");
  console.log("📋 Tenant Credentials:");
  console.log("   Pizza Kings  → admin@pizzakings.com / Admin@123  → /pizzakings");
  console.log("   Honey Hub    → admin@honeyhub.com  / Admin@123  → /honeyhub");
  console.log("\n🔑 Run create-super-admin.js to create the platform super admin");

  await mongoose.disconnect();
}

seed().catch(err => { console.error("❌", err.message); process.exit(1); });
