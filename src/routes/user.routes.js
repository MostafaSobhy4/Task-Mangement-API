const express = require("express");
const {
  getUsers,
  getUserByID,
  registration,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleCallback,
} = require("../controllers/user.controller");
const validatorRegister = require("../middlewares/validatorRegister.middleware");
const {
  globalRateLimit,
  authRateLimit,
} = require("../middlewares/ratelimit.middleware");
const Router = express.Router();
const upload = require("../middlewares/upload.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

Router.get("/", globalRateLimit, getUsers);

Router.post(
  "/register",
  authRateLimit,
  upload.single("avatar"),
  validatorRegister,
  registration,
)
  .get("/verify-email/:verificationToken", authRateLimit, verifyEmail)
  .post("/forgotPassword", authRateLimit, forgotPassword)
  .get(
    "/reset-password-email/:resetPasswordToken",
    authRateLimit,
    resetPassword,
  )
  .post("/login", authRateLimit, login)
  .post("/refresh", globalRateLimit, refresh)
  .post("/logout", authMiddleware, authRateLimit, logout)
  .get("/google", authRateLimit, googleLogin)
  .get("/google/callback", authRateLimit, googleCallback)
  .get("/:id", globalRateLimit, getUserByID);

module.exports = Router;
