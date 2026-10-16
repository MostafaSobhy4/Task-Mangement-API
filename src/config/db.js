const mongoose = require("mongoose");
const logger = require("../utils/logger");
const config = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(config.database.mongoUri);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
