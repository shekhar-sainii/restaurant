/**
 * Seed Test Users for all tenants.
 * Creates 2 customer users per tenant for testing tenant isolation.
 *
 * Run: node backend/scripts/seed-test-users.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const TEST_USERS = [
  // Pizza Kings
  { tenantId: "pizzakings", name: "Rahul Sharma",   email: "rahul@pizzakings.com",   mobile: "9100000001", password: "Test@123" },
  { tenantId: "pizzakings", name: "Priya Singh",    email: "priya@pizzakings.com",    mobile: "9100000002", password: "Test@123" },

  // Honey Hub
  { tenantId: "honeyhub",   name: "Amit Verma",     email: "amit@honeyhub.com",       mobile: "9100000003", password: "Test@123" },
  { tenantId: "honeyhub",   name: "Sunita Devi",    email: "sunita@honeyhub.com",     mobile: "9100000004", password: "Test@123" },

  // Bakery Bliss
  { tenantId: "bakerybliss",name: "Neha Gupta",     email: "neha@bakerybliss.com",    mobile: "9100000005", password: "Test@123" },
  { tenantId: "bakerybliss",name: "Vikram Joshi",   email: "vikram@bakerybliss.com",  mobile: "9100000006", password: "Test@123" },

  // Fresh Grocer
  { tenantId: "freshgrocer",name: "Kavita Patel",   email: "kavita@freshgrocer.com",  mobile: "9100000007", password: "Test@123" },
  { tenantId: "freshgrocer",name: "Suresh Kumar",   email: "suresh@freshgrocer.com",  mobile: "9100000008", password: "Test@123" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const users = db.collection("users");

  let created = 0;
  let skipped = 0;

  for (const u of TEST_USERS) {
    const existing = await users.findOne({ email: u.email });
    if (existing) { skipped++; continue; }

    const hashed = await bcrypt.hash(u.password, 10);
    await users.insertOne({
      tenantId: u.tenantId,
      name:     u.name,
      email:    u.email,
      mobile:   u.mobile,
      password: hashed,
      role:     "USER",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    created++;
  }

  console.log(`✅ Created: ${created} users`);
  console.log(`ℹ️  Skipped: ${skipped} (already exist)\n`);

  console.log("┌─────────────────────────────────────────────────────────────────┐");
  console.log("│  Test User Credentials (all passwords: Test@123)                │");
  console.log("├──────────────────┬──────────────────────────────────────────────┤");
  console.log("│  Tenant          │  Email                                       │");
  console.log("├──────────────────┼──────────────────────────────────────────────┤");
  for (const u of TEST_USERS) {
    const line = `│  ${u.tenantId.padEnd(16)}│  ${u.email.padEnd(44)}│`;
    console.log(line);
  }
  console.log("└──────────────────┴──────────────────────────────────────────────┘");
  console.log("\n📍 Storefront URLs:");
  console.log("   http://localhost:3000/pizzakings");
  console.log("   http://localhost:3000/honeyhub");
  console.log("   http://localhost:3000/bakerybliss");
  console.log("   http://localhost:3000/freshgrocer\n");

  await mongoose.disconnect();
}

seed().catch(err => { console.error("❌", err.message); process.exit(1); });
