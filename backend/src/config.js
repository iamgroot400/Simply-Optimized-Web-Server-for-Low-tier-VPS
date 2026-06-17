"use strict";
require("dotenv").config();

const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-insecure-secret-change-me-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024,
  isProd: process.env.NODE_ENV === "production",
};

if (config.isProd && config.jwtSecret.startsWith("dev-insecure")) {
  // Fail fast in production rather than run with a forgeable secret.
  throw new Error("JWT_SECRET must be set to a strong value in production.");
}

module.exports = config;
