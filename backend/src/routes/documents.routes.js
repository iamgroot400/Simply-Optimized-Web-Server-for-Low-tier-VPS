"use strict";
const express = require("express");
const ah = require("../utils/asyncHandler");
const { authenticate, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  upload: uploadDoc, listMine, listAll, getOne, getFile, updateStatus,
} = require("../controllers/documents.controller");

const router = express.Router();
router.use(authenticate);

// Student uploads their own document.
router.post("/upload", requireRole("student"), upload.single("file"), ah(uploadDoc));

// Listings.
router.get("/my", requireRole("student"), ah(listMine));
router.get("/all", requireRole("admin", "counsellor"), ah(listAll));

// Single document: metadata + file (access control inside controller).
router.get("/:id", ah(getOne));
router.get("/:id/file", ah(getFile));

// Review action.
router.patch("/:id/status", requireRole("admin", "counsellor"), ah(updateStatus));

module.exports = router;
