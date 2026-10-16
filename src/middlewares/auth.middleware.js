const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const config = require("../config/env");

const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      logger.warn("Authorization header missing");
      throw new AppError("Unauthorized", 401);
    }

    const [scheme, token] = auth.split(" ");

    if (scheme !== "Bearer" || !token) {
      logger.warn("Invalid authorization header format");
      throw new AppError("Unauthorized", 401);
    }

    const verToken = jwt.verify(token, config.jwt.accessTokenSecret);

    logger.info(`User authenticated successfully: ${verToken.id}`);

    req.user = verToken;

    next();
  } catch (err) {
    logger.warn(`Authentication failed: ${err.message}`);
    next(err);
  }
};

module.exports = authMiddleware;
