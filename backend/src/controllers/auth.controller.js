"use strict";
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");
const { signToken } = require("../utils/jwt");
const { isEmail, isNonEmptyString, passwordIssues } = require("../utils/validate");

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt });

// POST /api/auth/register — public self-registration (always role "student").
async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (!isNonEmptyString(name, 2)) return res.status(400).json({ error: "Name is required" });
  if (!isEmail(email)) return res.status(400).json({ error: "A valid email is required" });
  const pwIssues = passwordIssues(password);
  if (pwIssues.length) return res.status(400).json({ error: `Password needs ${pwIssues.join(", ")}` });

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return res.status(409).json({ error: "Email already registered" });

  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role: "student" },
  });
  const token = signToken({ sub: user.id, role: user.role, email: user.email, name: user.name });
  res.status(201).json({ token, user: publicUser(user) });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!isEmail(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken({ sub: user.id, role: user.role, email: user.email, name: user.name });
  res.json({ token, user: publicUser(user) });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
}

module.exports = { register, login, me };
