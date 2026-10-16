require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");
const config = require("./src/config/env");

const PORT = config.server.port || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();
