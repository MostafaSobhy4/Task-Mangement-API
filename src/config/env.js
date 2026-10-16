const config = {
  nodeenv: process.env.NODE_ENV || "development",
  server: {
    port: process.env.PORT,
  },

  database: {
    mongoUri: process.env.MONGO_URI,
  },

  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET,
    resetPasswordTokenSecret: process.env.RESET_PASSWORD_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    verificationTokenExpiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
    resetPasswordTokenExpiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN,
  },

  gmail: {
    user: process.env.MY_GMAIL,
    pass: process.env.MY_PASSWORD,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = config;
