"use strict";
const express = require("express");
const ah = require("../utils/asyncHandler");
const { authenticate, requireRole } = require("../middleware/auth");
const { list, create, update, remove } = require("../controllers/users.controller");

const router = express.Router();

// All user-management routes are admin-only.
router.use(authenticate, requireRole("admin"));

router.get("/", ah(list));
router.post("/", ah(create));
router.patch("/:id", ah(update));
router.delete("/:id", ah(remove));

module.exports = router;
