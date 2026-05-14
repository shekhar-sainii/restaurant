const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { User } = require("../models");
const ROLES = require("../common/constants/roles.constant");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant";

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to DB...");

    const superAdminEmail = "superadmin@qservice.com";
    const superAdminPassword = "superadmin123";

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists with email:", superAdminEmail);
      process.exit(0);
    }

    const superAdmin = new User({
      name: "Super Admin",
      email: superAdminEmail,
      password: superAdminPassword,
      role: ROLES.SUPER_ADMIN,
      tenantId: null,
      isActive: true,
    });

    await superAdmin.save();

    console.log("Super Admin created successfully!");
    console.log("Email:", superAdminEmail);
    console.log("Password:", superAdminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
