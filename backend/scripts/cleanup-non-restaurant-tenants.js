/**
 * Cleanup Script — Remove non-restaurant tenants.
 * Keeps: pizzakings (RESTAURANT)
 * Removes: honeyhub, bakerybliss, freshgrocer + their users/data
 *
 * Run: node backend/scripts/cleanup-non-restaurant-tenants.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const KEEP    = ["pizzakings"];
const REMOVE  = ["honeyhub", "bakerybliss", "freshgrocer"];

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;

  for (const tenantId of REMOVE) {
    console.log(`── Removing tenant: ${tenantId}`);

    const collections = ["users", "products", "categories", "orders", "payments", "tables", "messages"];
    for (const col of collections) {
      const r = await db.collection(col).deleteMany({ tenantId });
      if (r.deletedCount > 0) console.log(`  ✅ ${col}: deleted ${r.deletedCount}`);
    }

    const t = await db.collection("tenants").deleteOne({ tenantId });
    console.log(`  ✅ tenant record: deleted ${t.deletedCount}`);
  }

  // Verify what's left
  const remaining = await db.collection("tenants").find({}).toArray();
  console.log(`\n✅ Remaining tenants: ${remaining.map(t => t.tenantId).join(", ")}`);

  await mongoose.disconnect();
  console.log("\n🎉 Cleanup complete. Only restaurant tenants remain.");
}

cleanup().catch(err => { console.error("❌", err.message); process.exit(1); });
