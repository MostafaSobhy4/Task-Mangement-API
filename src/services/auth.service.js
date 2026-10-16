const jwt = require("jsonwebtoken");
const config = require("../config/env");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.jwt.accessTokenSecret,
    {
      expiresIn: config.jwt.accessTokenExpiresIn,
    },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    config.jwt.refreshTokenSecret,
    {
      expiresIn: config.jwt.refreshTokenExpiresIn,
    },
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
