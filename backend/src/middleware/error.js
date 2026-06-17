"use strict";
const multer = require("multer");
const config = require("../config");

// 404 for unmatched API routes.
function notFound(_req, res) {
  res.status(404).json({ error: "Not found" });
}

// Central error handler — normalizes Multer, Prisma, and generic errors.
function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: `File exceeds ${config.maxUploadBytes / 1024 / 1024}MB limit` });
    }
    return res.status(400).json({ error: err.message || "Upload error" });
  }
  // Prisma unique-constraint violation.
  if (err && err.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists" });
  }
  if (!config.isProd) console.error(err);
  res.status(err.status || 500).json({ error: err.publicMessage || "Internal server error" });
}

module.exports = { notFound, errorHandler };
