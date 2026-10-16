const { OAuth2Client } = require("google-auth-library");
const config = require("./env");

const googleClient = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  config.google.callbackUrl,
);

module.exports = googleClient;
