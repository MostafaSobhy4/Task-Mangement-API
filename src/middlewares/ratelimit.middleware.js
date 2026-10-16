const ratelimit = require("express-rate-limit");

const globalRateLimit = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authRateLimit = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts, please try again later",
});

module.exports = {
  globalRateLimit,
  authRateLimit,
};
