require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const sa = await db.collection("users").findOne({ role: "SUPER_ADMIN" });
  if (!sa) {
    console.log("No SUPER_ADMIN found in DB");
    await mongoose.disconnect();
    return;
  }

  console.log("Found:", { email: sa.email, role: sa.role, isActive: sa.isActive });

  // Test password match
  const testPwd = "SuperAdmin@123";
  const match = await bcrypt.compare(testPwd, sa.password);
  console.log("Password 'SuperAdmin@123' matches:", match);

  // If not matching, reset it
  if (!match) {
    const hashed = await bcrypt.hash(testPwd, 10);
    await db.collection("users").updateOne({ _id: sa._id }, { $set: { password: hashed, isActive: true } });
    console.log("Password reset to: SuperAdmin@123");
  }

  await mongoose.disconnect();
}

check().catch(console.error);
