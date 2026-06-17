"use strict";
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const config = require("../config");

const uploadRoot = path.resolve(process.cwd(), config.uploadDir);
fs.mkdirSync(uploadRoot, { recursive: true });

// Allowed document types: PDF + common images.
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    // Randomized on-disk name prevents collisions and path/extension tricks.
    const ext = (path.extname(file.originalname) || "").toLowerCase().replace(/[^.a-z0-9]/g, "");
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext.slice(0, 8)}`);
  },
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) {
    const err = new Error("Unsupported file type");
    err.status = 400;
    err.publicMessage = "Unsupported file type (allowed: PDF, JPG, PNG, WEBP)";
    return cb(err);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxUploadBytes, files: 1 },
});

module.exports = { upload, uploadRoot };
