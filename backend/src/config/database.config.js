const mongoose = require("mongoose");
const config = require("./env.config");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB Disconnected");
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

module.exports = { connectDatabase, disconnectDatabase };
