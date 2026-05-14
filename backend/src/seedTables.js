const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Table = require("./models/table.model");
const TABLE_STATUS = require("./common/constants/table.constant");

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for table seeding...");
    // Clear existing tables
    await Table.deleteMany({});
    console.log("Cleared existing tables.");
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({
        tableNumber: i,
        capacity: i % 2 === 0 ? 4 : 2,
        status: TABLE_STATUS.AVAILABLE,
      });
    }
    await Table.insertMany(tables);
    console.log("Successfully seeded 10 tables.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedTables();