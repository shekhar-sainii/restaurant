/**
 * Dedicated Database Migration Script
 * Migrates each tenant from shared DB to its own dedicated MongoDB database.
 *
 * Run: node backend/scripts/migrate-to-dedicated-db.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const MONGO_BASE = process.env.MONGO_URI.replace(/\/[^/]+$/, ""); // strip DB name
// e.g. mongodb://localhost:27017

const COLLECTIONS_TO_MIGRATE = [
  "users",
  "products",
  "categories",
  "orders",
  "payments",
  "tables",
  "messages",
  "otps",
];

async function migrateOneTenant(sourceDb, tenantId, dbUri) {
  console.log(`\n  ── Migrating tenant: ${tenantId} → ${dbUri}`);

  const targetConn = await mongoose.createConnection(dbUri).asPromise();
  const targetDb   = targetConn.db;

  let totalMigrated = 0;

  for (const colName of COLLECTIONS_TO_MIGRATE) {
    const sourceCol = sourceDb.collection(colName);
    const targetCol = targetDb.collection(colName);

    // Count existing in target (idempotent — skip if already migrated)
    const existingCount = await targetCol.countDocuments();
    if (existingCount > 0) {
      console.log(`    ℹ️  ${colName}: already has ${existingCount} docs — skipping`);
      continue;
    }

    // Fetch records belonging to this tenant
    const filter = colName === "users"
      ? { $or: [{ tenantId }, { tenantId: null, role: { $ne: "SUPER_ADMIN" } }] }
      : { tenantId };

    // For users: only migrate users belonging to this tenant
    const userFilter = { tenantId };
    const actualFilter = colName === "users" ? userFilter : { tenantId };

    const docs = await sourceCol.find(actualFilter).toArray();

    if (docs.length === 0) {
      console.log(`    ℹ️  ${colName}: no records for tenant ${tenantId}`);
      continue;
    }

    await targetCol.insertMany(docs, { ordered: false });
    totalMigrated += docs.length;
    console.log(`    ✅ ${colName}: migrated ${docs.length} records`);
  }

  // Copy indexes
  for (const colName of COLLECTIONS_TO_MIGRATE) {
    try {
      const sourceIndexes = await sourceDb.collection(colName).indexes();
      const targetCol = targetDb.collection(colName);
      for (const idx of sourceIndexes) {
        if (idx.name === "_id_") continue;
        const { key, ...options } = idx;
        delete options.ns;
        delete options.v;
        try {
          await targetCol.createIndex(key, options);
        } catch (_) {} // ignore duplicate index errors
      }
    } catch (_) {}
  }

  await targetConn.close();
  console.log(`  ✅ Done: ${tenantId} — ${totalMigrated} total records migrated`);
  return totalMigrated;
}

async function run() {
  console.log("🚀 Starting dedicated database migration...\n");

  const masterConn = await mongoose.connect(process.env.MONGO_URI);
  const sourceDb   = mongoose.connection.db;
  console.log(`✅ Connected to source DB: ${process.env.MONGO_URI}\n`);

  // Fetch all tenants
  const tenants = await sourceDb.collection("tenants").find({}).toArray();
  console.log(`Found ${tenants.length} tenants to migrate\n`);

  const results = [];

  for (const tenant of tenants) {
    const dbUri = `${MONGO_BASE}/tenant_${tenant.tenantId}`;

    const count = await migrateOneTenant(sourceDb, tenant.tenantId, dbUri);

    // Update tenant record with dbUri and dbMode
    await sourceDb.collection("tenants").updateOne(
      { tenantId: tenant.tenantId },
      { $set: { dbMode: "DEDICATED", dbUri } }
    );
    console.log(`  ✅ Updated tenant.dbUri = ${dbUri}`);

    results.push({ tenantId: tenant.tenantId, dbUri, records: count });
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("🎉 Migration Complete!\n");
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│  Tenant Database Map                                    │");
  console.log("├─────────────────────────────────────────────────────────┤");
  for (const r of results) {
    const line = `│  ${r.tenantId.padEnd(16)} → tenant_${r.tenantId.padEnd(16)} (${r.records} docs)`;
    console.log(line.padEnd(57) + "│");
  }
  console.log("└─────────────────────────────────────────────────────────┘");
  console.log("\n📝 Each tenant now has its own dedicated MongoDB database.");
  console.log("📝 Shared DB still intact as backup.\n");

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
