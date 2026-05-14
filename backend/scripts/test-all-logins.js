require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to:", process.env.MONGO_URI, "\n");

  const User = require("../src/models/user.model");

  const accounts = [
    { email: "admin@pizzakings.com",  password: "Admin@123" },
    { email: "admin@honeyhub.com",    password: "Admin@123" },
    { email: "admin@bakerybliss.com", password: "Admin@123" },
    { email: "admin@freshgrocer.com", password: "Admin@123" },
  ];

  for (const acc of accounts) {
    const user = await User.findOne({ email: acc.email }).select("+password");
    if (!user) {
      console.log(`❌ ${acc.email} — NOT FOUND in shared DB`);
      // Check raw collection
      const raw = await mongoose.connection.db.collection("users").findOne({ email: acc.email });
      console.log(`   Raw collection:`, raw ? `found (role: ${raw.role}, tenantId: ${raw.tenantId})` : "also not found");
      continue;
    }
    const match = await bcrypt.compare(acc.password, user.password);
    console.log(`${match ? "✅" : "❌"} ${acc.email} — found, tenantId: ${user.tenantId}, passwordMatch: ${match}`);
  }

  await mongoose.disconnect();
}

test().catch(console.error);
