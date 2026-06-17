"use strict";
const express = require("express");
const rateLimit = require("express-rate-limit");
const ah = require("../utils/asyncHandler");
const { authenticate } = require("../middleware/auth");
const { register, login, me } = require("../controllers/auth.controller");

const router = express.Router();

// Throttle auth attempts to blunt brute-force / abuse.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.post("/register", authLimiter, ah(register));
router.post("/login", authLimiter, ah(login));
router.get("/me", authenticate, ah(me));

module.exports = router;
