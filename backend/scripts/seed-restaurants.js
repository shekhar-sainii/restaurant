/**
 * Seed Script — Creates 2 test restaurant tenants.
 * Each restaurant gets its own dedicated database.
 *
 * Run: node backend/scripts/seed-restaurants.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const MONGO_BASE = process.env.MONGO_URI.replace(/\/[^/]+$/, "");

const RESTAURANTS = [
  {
    tenantId: "pizzakings",
    slug: "pizzakings",
    businessName: "Pizza Kings",
    dbUri: `${MONGO_BASE}/tenant_pizzakings`,
    theme: { primaryColor: "#c9a227", backgroundColor: "#0f0f0f", fontFamily: "Playfair Display" },
    paymentSettings: {
      cashEnabled: true, upiEnabled: true,
      upiIdPrimary: "shivanshsaini733@oksbi",
      upiIdSecondary: "9520640928@okbizaxis",
      upiMerchantName: "Pizza Kings",
    },
    enabledModules: { dineIn: true, delivery: true, tableOrdering: true, qrOrdering: true, guestOrdering: true, chat: true, staffMgmt: true },
    subscriptionPlan: "FREE",
    admin: { name: "Pizza Kings Admin", email: "admin@pizzakings.com", mobile: "9000000001", password: "Admin@123" },
  },
  {
    tenantId: "spicegardens",
    slug: "spicegardens",
    businessName: "Spice Gardens",
    dbUri: `${MONGO_BASE}/tenant_spicegardens`,
    theme: { primaryColor: "#ef4444", backgroundColor: "#0f0000", fontFamily: "Playfair Display" },
    paymentSettings: {
      cashEnabled: true, upiEnabled: true,
      upiIdPrimary: "spicegardens@upi",
      upiIdSecondary: null,
      upiMerchantName: "Spice Gardens",
    },
    enabledModules: { dineIn: true, delivery: true, tableOrdering: true, qrOrdering: true, guestOrdering: true, chat: true, staffMgmt: true },
    subscriptionPlan: "STARTER",
    admin: { name: "Spice Gardens Admin", email: "admin@spicegardens.com", mobile: "9000000010", password: "Admin@123" },
  },
];

const COLLECTIONS = ["users", "products", "categories", "orders", "payments", "tables", "messages"];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to shared DB\n");

  const db = mongoose.connection.db;

  for (const r of RESTAURANTS) {
    console.log(`── Seeding: ${r.businessName} (${r.tenantId})`);

    // 1. Create admin user in shared DB
    let adminId;
    const existingAdmin = await db.collection("users").findOne({ email: r.admin.email });
    if (existingAdmin) {
      adminId = existingAdmin._id;
      console.log(`  ℹ️  Admin exists: ${r.admin.email}`);
    } else {
      const hashed = await bcrypt.hash(r.admin.password, 10);
      const res = await db.collection("users").insertOne({
        tenantId: r.tenantId, name: r.admin.name, email: r.admin.email,
        mobile: r.admin.mobile, password: hashed, role: "ADMIN",
        isActive: true, createdAt: new Date(), updatedAt: new Date(),
      });
      adminId = res.insertedId;
      console.log(`  ✅ Admin: ${r.admin.email} / ${r.admin.password}`);
    }

    // 2. Upsert tenant record
    const existing = await db.collection("tenants").findOne({ tenantId: r.tenantId });
    if (existing) {
      console.log(`  ℹ️  Tenant exists: ${r.tenantId}`);
    } else {
      await db.collection("tenants").insertOne({
        tenantId: r.tenantId, slug: r.slug, businessName: r.businessName,
        businessType: "RESTAURANT", status: "ACTIVE",
        dbMode: "DEDICATED", dbUri: r.dbUri,
        logo: null, favicon: null, banner: null,
        theme: r.theme, ownerAdminId: adminId,
        paymentSettings: { razorpayEnabled: false, razorpayKeyId: null, ...r.paymentSettings },
        enabledModules: r.enabledModules,
        subscriptionPlan: r.subscriptionPlan,
        contactEmail: r.admin.email, contactPhone: r.admin.mobile,
        createdAt: new Date(), updatedAt: new Date(),
      });
      console.log(`  ✅ Tenant created: /${r.slug} → ${r.dbUri}`);
    }

    // 3. Migrate existing shared-DB data to dedicated DB
    const targetConn = await mongoose.createConnection(r.dbUri).asPromise();
    const targetDb   = targetConn.db;

    for (const col of COLLECTIONS) {
      const existing = await targetDb.collection(col).countDocuments();
      if (existing > 0) { console.log(`  ℹ️  ${col}: already migrated`); continue; }

      const docs = await db.collection(col).find({ tenantId: r.tenantId }).toArray();
      if (docs.length > 0) {
        await targetDb.collection(col).insertMany(docs, { ordered: false });
        console.log(`  ✅ ${col}: ${docs.length} records → dedicated DB`);
      }
    }

    await targetConn.close();
  }

  console.log("\n🎉 Restaurant seed complete!\n");
  console.log("┌──────────────────────────────────────────────────────────────┐");
  console.log("│  Restaurant Credentials                                      │");
  console.log("├──────────────────────────────────────────────────────────────┤");
  for (const r of RESTAURANTS) {
    console.log(`│  ${r.businessName.padEnd(20)} ${r.admin.email.padEnd(30)} Admin@123  │`);
  }
  console.log("├──────────────────────────────────────────────────────────────┤");
  console.log("│  URLs: /pizzakings   /spicegardens                           │");
  console.log("│  Super Admin: node scripts/create-super-admin.js             │");
  console.log("└──────────────────────────────────────────────────────────────┘\n");

  await mongoose.disconnect();
}

seed().catch(err => { console.error("❌", err.message); process.exit(1); });
