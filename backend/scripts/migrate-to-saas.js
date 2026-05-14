/**
 * SaaS Migration Script
 * Migrates existing single-tenant restaurant data to multi-tenant SaaS architecture.
 * 
 * Run: node backend/scripts/migrate-to-saas.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const TENANT_ID = "pizzakings";
const TENANT_SLUG = "pizzakings";

async function migrate() {
  console.log("🚀 Starting SaaS migration...\n");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;

  // 1. Create Tenant record if not exists
  const tenants = db.collection("tenants");
  const existing = await tenants.findOne({ tenantId: TENANT_ID });

  if (!existing) {
    await tenants.insertOne({
      tenantId: TENANT_ID,
      slug: TENANT_SLUG,
      businessName: "Pizza Kings",
      businessType: "RESTAURANT",
      status: "ACTIVE",
      dbMode: "SHARED",
      dbUri: null,
      logo: null,
      theme: {
        primaryColor: "#c9a227",
        backgroundColor: "#0f0f0f",
        fontFamily: "Playfair Display",
      },
      paymentSettings: {
        cashEnabled: true,
        upiEnabled: true,
        upiIdPrimary: process.env.UPI_ID_PRIMARY || "shivanshsaini733@oksbi",
        upiIdSecondary: process.env.UPI_ID_SECONDARY || "9520640928@okbizaxis",
        upiMerchantName: process.env.UPI_MERCHANT_NAME || "Pizza Kings",
        razorpayEnabled: false,
        razorpayKeyId: null,
      },
      enabledModules: {
        dineIn: true,
        delivery: true,
        tableOrdering: true,
        qrOrdering: true,
        combos: false,
        weightPricing: false,
        chat: true,
        staffMgmt: true,
      },
      subscriptionPlan: "FREE",
      subscriptionExpiry: null,
      contactEmail: process.env.MAIL_FROM_ADDRESS || null,
      contactPhone: null,
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Created tenant: ${TENANT_ID}`);
  } else {
    console.log(`ℹ️  Tenant ${TENANT_ID} already exists, skipping creation`);
  }

  // 2. Migrate all collections — add tenantId where missing
  const collections = [
    { name: "users",      filter: { tenantId: { $in: [null, undefined] }, role: { $ne: "SUPER_ADMIN" } } },
    { name: "orders",     filter: { tenantId: { $in: [null, undefined] } } },
    { name: "products",   filter: { tenantId: { $in: [null, undefined] } } },
    { name: "categories", filter: { tenantId: { $in: [null, undefined] } } },
    { name: "tables",     filter: { tenantId: { $in: [null, undefined] } } },
    { name: "payments",   filter: { tenantId: { $in: [null, undefined] } } },
    { name: "messages",   filter: { tenantId: { $in: [null, undefined] } } },
  ];

  for (const col of collections) {
    const collection = db.collection(col.name);
    const count = await collection.countDocuments(col.filter);

    if (count > 0) {
      const result = await collection.updateMany(
        col.filter,
        { $set: { tenantId: TENANT_ID } }
      );
      console.log(`✅ ${col.name}: migrated ${result.modifiedCount} records → tenantId: ${TENANT_ID}`);
    } else {
      console.log(`ℹ️  ${col.name}: no records to migrate`);
    }
  }

  // 3. Set tenant_slug in a config note (for reference)
  console.log(`\n📝 Frontend: set localStorage.setItem('tenant_slug', '${TENANT_SLUG}') or add to .env`);
  console.log(`📝 API calls: add header X-Tenant-Slug: ${TENANT_SLUG}\n`);

  console.log("🎉 Migration complete!\n");
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
