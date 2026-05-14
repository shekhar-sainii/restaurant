require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to:", process.env.MONGO_URI);

  // Load User model (registers on default connection)
  const User = require("../src/models/user.model");

  // Test findByEmail with +password
  const user = await User.findOne({ email: "superadmin@qservice.com" }).select("+password");
  console.log("User found:", !!user);
  if (user) {
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("isActive:", user.isActive);
    console.log("Has password:", !!user.password);
    console.log("Has isPasswordCorrect method:", typeof user.isPasswordCorrect);

    const match = await user.isPasswordCorrect("SuperAdmin@123");
    console.log("Password match:", match);
  } else {
    // Check raw collection
    const raw = await mongoose.connection.db.collection("users").findOne({ email: "superadmin@qservice.com" });
    console.log("Raw DB result:", raw ? { email: raw.email, role: raw.role } : "NOT FOUND");
  }

  await mongoose.disconnect();
}

test().catch(console.error);
