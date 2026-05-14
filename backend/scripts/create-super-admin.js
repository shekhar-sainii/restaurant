/**
 * Creates the platform Super Admin account.
 * Run: node backend/scripts/create-super-admin.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const User = require("../src/models/user.model");

  const email    = process.env.SUPER_ADMIN_EMAIL    || "superadmin@pizzakings.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123";
  const name     = process.env.SUPER_ADMIN_NAME     || "Super Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === "SUPER_ADMIN") {
      console.log(`ℹ️  Super admin already exists: ${email}`);
    } else {
      await User.findByIdAndUpdate(existing._id, { role: "SUPER_ADMIN", tenantId: null });
      console.log(`✅ Upgraded existing user to SUPER_ADMIN: ${email}`);
    }
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashed,
      role: "SUPER_ADMIN",
      tenantId: null,
      isActive: true,
    });
    console.log(`✅ Super admin created: ${email}`);
    console.log(`🔑 Password: ${password}`);
  }

  await mongoose.disconnect();
  console.log("\n🎉 Done! Login at /super-admin/login");
}

createSuperAdmin().catch(err => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
