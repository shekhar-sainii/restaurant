const mongoose = require("mongoose");
const Tenant = require("../models/tenant.model");
const User = require("../models/user.model");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant";
const OLD_TENANT_ID = "opk01";
const NEW_TENANT_ID = "pizzaking"; // Renaming tenantId too for consistency
const NEW_SLUG = "pizzaking";
const NEW_NAME = "Pizza King";

async function rename() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Update Tenant
    const tenant = await Tenant.findOne({ tenantId: OLD_TENANT_ID });
    if (tenant) {
      tenant.businessName = NEW_NAME;
      tenant.slug = NEW_SLUG;
      tenant.tenantId = NEW_TENANT_ID;
      await tenant.save();
      console.log(`Tenant renamed to: ${NEW_NAME} with slug: ${NEW_SLUG}`);
    } else {
      console.log("Tenant not found with ID:", OLD_TENANT_ID);
    }

    // 2. Update Admin User
    const admin = await User.findOne({ email: "admin@onlypizzaking.com" });
    if (admin) {
      admin.name = "Pizza King Admin";
      admin.email = "admin@pizzaking.com";
      admin.tenantId = NEW_TENANT_ID;
      await admin.save();
      console.log("Admin user updated to: admin@pizzaking.com");
    }

    // 3. Update all products and categories tenantId
    const Category = require("../models/category.model");
    const Product = require("../models/product.model");

    const catUpdate = await Category.updateMany({ tenantId: OLD_TENANT_ID }, { $set: { tenantId: NEW_TENANT_ID } });
    console.log(`Updated ${catUpdate.modifiedCount} categories`);

    const prodUpdate = await Product.updateMany({ tenantId: OLD_TENANT_ID }, { $set: { tenantId: NEW_TENANT_ID } });
    console.log(`Updated ${prodUpdate.modifiedCount} products`);

    const userUpdate = await User.updateMany({ tenantId: OLD_TENANT_ID }, { $set: { tenantId: NEW_TENANT_ID } });
    console.log(`Updated ${userUpdate.modifiedCount} additional users (if any)`);

    console.log("Renaming completed successfully!");
    console.log("----------------------------");
    console.log(`Tenant Name: ${NEW_NAME}`);
    console.log(`URL Slug: ${NEW_SLUG}`);
    console.log(`Admin Email: admin@pizzaking.com`);
    console.log(`Admin Password: Password@123`);
    console.log("----------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Renaming failed:", error);
    process.exit(1);
  }
}

rename();
