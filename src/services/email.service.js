const nodemailer = require("nodemailer");
const getEmailTemplate = require("../utils/emailTemplate");
const config = require("../config/env");

const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  let html = getEmailTemplate("verify-email.html");

  const verificationUrl = `http://localhost:2005/api/auth/verify-email/${verificationToken}`;

  html = html.replace("{{VERIFICATION_URL}}", verificationUrl);

  await transporter.sendMail({
    from: config.email.user,
    to: email,
    subject: "Verify Your Email",
    html,
  });
};

const sendResetPasswordEmail = async (email, resetPasswordToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  let html = getEmailTemplate("reset-password-email.html");

  const resetPasswordUrl = `http://localhost:2005/api/auth/reset-password-email/${resetPasswordToken}`;

  html = html.replace("{{RESET_PASSWORD_URL}}", resetPasswordUrl);

  await transporter.sendMail({
    from: config.email.user,
    to: email,
    subject: "Reset Your Password",
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};
