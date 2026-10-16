const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncWrapper = require("../middlewares/asyncwrapper.middleware");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../services/email.service");
const uploadToCloudinary = require("../services/upload.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const googleClient = require("../config/google");
const logger = require("../utils/logger");
const config = require("../config/env");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/auth.service");
const { log } = require("winston");

const getUsers = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, ...filter } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const users = await User.find(filter, { name: 1, email: 1, role: 1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: "Success",
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});
const getUserByID = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, { name: 1, email: 1, role: 1 });
  if (!user) {
    logger.warn(`User not found for ID: ${id}`);
    throw new AppError("User not found", 404);
  }
  logger.info(`User retrieved successfully: ${user._id}`);
  res.status(200).json({ status: "Success", data: user });
});

const registration = asyncWrapper(async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 7);

  let avatar = null;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    avatar = result;
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    avatar,
  });

  const verificationToken = jwt.sign(
    {
      id: user._id,
    },
    config.jwt.verificationTokenSecret,
    {
      expiresIn: config.jwt.verificationTokenExpiresIn,
    },
  );

  await sendVerificationEmail(email, verificationToken);

  logger.info(`User registered successfully: ${user._id}`);

  res.status(201).json({
    status: "Success",
    message: "Please check your email to verify your account.",
  });
});

const verifyEmail = asyncWrapper(async (req, res) => {
  const verificationToken = req.params.verificationToken;
  const decoded = jwt.verify(
    verificationToken,
    config.jwt.verificationTokenSecret,
  );

  const user = await User.findById(decoded.id);

  if (!user) {
    logger.warn("Email verification failed: invalid or expired token");
    throw new AppError("User not found", 404);
  }

  user.isVerified = true;
  await user.save();

  logger.info(`Email verified successfully for user: ${user._id}`);

  res.status(200).json({
    status: "Success",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Login attempt failed for non-existent email: ${email}`);
    throw new AppError("Invalid email", 401);
  }

  if (!user.isVerified) {
    logger.warn(`Login attempt for unverified account: ${email}`);
    throw new AppError("Please verify your email first", 403);
  }

  if (user.isLoggedin) {
    logger.warn(`Login attempt for already logged-in user: ${email}`);
    throw new AppError("User is already logged in", 403);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    logger.warn(`Login attempt failed for email: ${email}`);
    throw new AppError("Invalid password", 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.isLoggedin = true;
  await user.save();

  logger.info(`User logged in successfully: ${user._id}`);

  res.status(200).json({ status: "Success", accessToken: accessToken });
});

const refresh = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    logger.warn("Refresh token missing in request");
    throw new AppError("Refresh token is required", 401);
  }

  const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);

  const user = await User.findById(decoded.id);

  if (!user) {
    logger.warn(
      `Refresh token attempt failed for non-existent user ID: ${decoded.id}`,
    );
    throw new AppError("User not found", 404);
  }

  const newAccessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info(`Access token refreshed for user: ${decoded.id}`);

  res.status(200).json({
    status: "Success",
    accessToken: newAccessToken,
  });
});

const logout = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    logger.warn(
      `Logout attempt failed for non-existent user ID: ${req.user.id}`,
    );
    throw new AppError("User not found", 404);
  }

  user.isLoggedin = false;
  await user.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
  });

  logger.info(`User logged out successfully: ${user._id}`);

  res
    .status(200)
    .json({ status: "Success", message: "Logged out successfully" });
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(
      `Forgot password attempt failed for non-existent email: ${email}`,
    );
    throw new AppError("User not found", 404);
  }

  const resetPasswordToken = jwt.sign(
    {
      id: user._id,
    },
    config.jwt.resetPasswordTokenSecret,
    {
      expiresIn: config.jwt.resetPasswordTokenExpiresIn,
    },
  );

  await sendResetPasswordEmail(user.email, resetPasswordToken);

  logger.info(`Password reset email sent for user: ${user._id}`);

  res.status(200).json({
    status: "Success",
    message: "Password reset email sent successfully.",
  });
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  const decoded = jwt.verify(
    resetPasswordToken,
    config.jwt.resetPasswordTokenSecret,
  );

  const user = await User.findById(decoded.id);

  if (!user) {
    logger.warn(
      `Password reset attempt failed for non-existent user ID: ${decoded.id}`,
    );
    throw new AppError("User not found", 404);
  }

  const hashedPassword = await bcrypt.hash(password, 7);

  user.password = hashedPassword;

  await user.save();

  logger.info(`Password reset successfully for user: ${user._id}`);

  res.status(200).json({
    status: "Success",
    message: "Password reset successfully.",
  });
});

const googleLogin = asyncWrapper(async (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
  });

  res.json({
    url: authUrl,
  });
});

const googleCallback = asyncWrapper(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    logger.warn("Google authorization code is required");
    throw new AppError("Google authorization code is required", 400);
  }

  const { tokens } = await googleClient.getToken(code);

  googleClient.setCredentials(tokens);

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();

  const { sub, email, name, picture } = payload;

  let user = await User.findOne({
    googleId: sub,
  });

  if (user) {
    user.isLoggedin = true;
    await user.save();
    logger.info(`Google login successful for existing user: ${user._id}`);
  } else {
    user = await User.create({
      name,
      email,
      isLoggedin: true,
      googleId: sub,
      authProvider: "google",
      avatar: picture,
    });
    logger.info(`Google login successful for new user: ${user._id}`);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "Success",
    message: "Google login successful",
    accessToken,
  });
});

module.exports = {
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
};
