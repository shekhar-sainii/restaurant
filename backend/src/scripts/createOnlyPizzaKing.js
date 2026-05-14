const mongoose = require("mongoose");
const Tenant = require("../models/tenant.model");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const ROLES = require("../common/constants/roles.constant");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant";
const NEW_TENANT_ID = "opk01";
const NEW_SLUG = "onlypizzaking";
const NEW_NAME = "Only Pizza King";

const catImages = {
  "BURGER": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=300",
  "SANDWICH": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=300",
  "FRIES": "https://images.unsplash.com/photo-1630384066252-19e1ad95b4f6?auto=format&fit=crop&q=80&w=300",
  "PASTA": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=300",
  "SIDE ORDER": "https://images.unsplash.com/photo-1576097449798-5c6f423f80c1?auto=format&fit=crop&q=80&w=300",
  "PIZZA": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300",
  "COMBO": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=300",
  "DOUBLE COMBO": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=300",
  "EXTRA TOPPING": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=300",
  "EXTRA CHEESE": "https://images.unsplash.com/photo-1523293662444-f7b21c1a0690?auto=format&fit=crop&q=80&w=300",
  "SHAKE & DESSERT": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=300",
  "FAST FOOD": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=300"
};

async function setup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Create User
    let admin = await User.findOne({ email: "admin@onlypizzaking.com" });
    if (!admin) {
      admin = await User.create({
        name: "OPK Admin",
        email: "admin@onlypizzaking.com",
        password: "Password@123",
        role: ROLES.ADMIN,
        tenantId: NEW_TENANT_ID
      });
      console.log("Admin user created");
    }

    // 2. Create Tenant
    let tenant = await Tenant.findOne({ tenantId: NEW_TENANT_ID });
    if (!tenant) {
      tenant = await Tenant.create({
        tenantId: NEW_TENANT_ID,
        slug: NEW_SLUG,
        businessName: NEW_NAME,
        ownerAdminId: admin._id,
        logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
        theme: {
          primaryColor: "#ff4d4d", // Red theme for "Only Pizza King"
          secondaryColor: "#ffffff",
          backgroundColor: "#000000",
          surfaceColor: "#111111",
          mode: "dark"
        },
        enabledModules: {
          dineIn: true, delivery: true, tableOrdering: true, qrOrdering: true,
          combos: true, chat: true, staffMgmt: true, guestOrdering: true
        }
      });
      console.log("Tenant created");
    }

    // 3. Copy Products & Categories from restaurant01
    const oldTenantId = "restaurant01";
    const oldCategories = await Category.find({ tenantId: oldTenantId });
    
    for (const oldCat of oldCategories) {
      let newCat = await Category.findOne({ name: oldCat.name, tenantId: NEW_TENANT_ID });
      if (!newCat) {
        newCat = await Category.create({
          name: oldCat.name,
          slug: oldCat.slug,
          tenantId: NEW_TENANT_ID,
          image: catImages[oldCat.name] || oldCat.image,
          sortOrder: oldCat.sortOrder
        });
        console.log(`Category ${oldCat.name} created for ${NEW_NAME}`);
      }

      const products = await Product.find({ categoryId: oldCat._id, tenantId: oldTenantId });
      for (const p of products) {
        const existing = await Product.findOne({ name: p.name, tenantId: NEW_TENANT_ID });
        if (!existing) {
          await Product.create({
            tenantId: NEW_TENANT_ID,
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            categoryId: newCat._id,
            hasVariations: p.hasVariations,
            variations: p.variations,
            isAvailable: p.isAvailable,
            isVeg: p.isVeg
          });
          console.log(`Product ${p.name} copied`);
        }
      }
    }

    console.log("Setup completed successfully!");
    console.log("----------------------------");
    console.log(`Tenant Name: ${NEW_NAME}`);
    console.log(`URL Slug: ${NEW_SLUG}`);
    console.log(`Admin Email: admin@onlypizzaking.com`);
    console.log(`Admin Password: Password@123`);
    console.log("----------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

setup();
