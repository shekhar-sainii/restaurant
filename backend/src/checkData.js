const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Product = require("./models/product.model");
const Category = require("./models/category.model");

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const catCount = await Category.countDocuments({});
    const prodCount = await Product.countDocuments({});
    const availProdCount = await Product.countDocuments({ isAvailable: true });
    
    // Check Tables
    const Table = require("./models/table.model");
    const tableCount = await Table.countDocuments({});

    console.log(`--- Database Health Check ---`);
    console.log(`Total Categories: ${catCount}`);
    console.log(`Total Products: ${prodCount}`);
    console.log(`Available Products: ${availProdCount}`);
    console.log(`Total Tables: ${tableCount}`);

    if (tableCount === 0) {
      console.log(`WARNING: No tables found! Seeding 10 tables...`);
      const tables = Array.from({ length: 10 }, (_, i) => ({
        tableNumber: i + 1,
        capacity: i < 5 ? 2 : 4,
        status: "AVAILABLE"
      }));
      await Table.insertMany(tables);
      console.log(`SUCCESS: Created 10 tables.`);
    }

    if (availProdCount === 0 && prodCount > 0) {
      console.log(`WARNING: All products are marked as unavailable! Fixing now...`);
      await Product.updateMany({}, { isAvailable: true });
      console.log(`FORCE FIX: All products marked as available.`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
};

checkData();
