"use strict";
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");
const { isEmail, isNonEmptyString, passwordIssues, ROLES } = require("../utils/validate");

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt });

function audit(actorId, action, detail) {
  // Fire-and-forget; never block the response on the audit write.
  prisma.auditLog.create({ data: { actorId, action, detail } }).catch(() => {});
}

// GET /api/users  (admin) — optional ?search= &role=
async function list(req, res) {
  const { search, role } = req.query;
  const where = {};
  if (role && ROLES.includes(role)) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } },
    ];
  }
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true, _count: { select: { documents: true } } },
  });
  res.json({ users });
}

// POST /api/users  (admin) — create a user directly with any role.
async function create(req, res) {
  const { name, email, password, role } = req.body || {};
  if (!isNonEmptyString(name, 2)) return res.status(400).json({ error: "Name is required" });
  if (!isEmail(email)) return res.status(400).json({ error: "A valid email is required" });
  if (!ROLES.includes(role)) return res.status(400).json({ error: "Role must be student, admin, or counsellor" });
  const pwIssues = passwordIssues(password);
  if (pwIssues.length) return res.status(400).json({ error: `Password needs ${pwIssues.join(", ")}` });

  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role },
  });
  audit(req.user.id, "USER_CREATED", `${user.email} (${user.role})`);
  res.status(201).json({ user: publicUser(user) });
}

// PATCH /api/users/:id  (admin) — update name/role/password.
async function update(req, res) {
  const { id } = req.params;
  const { name, role, password } = req.body || {};

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "User not found" });

  const data = {};
  if (name !== undefined) {
    if (!isNonEmptyString(name, 2)) return res.status(400).json({ error: "Invalid name" });
    data.name = name.trim();
  }
  if (role !== undefined) {
    if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });
    // Don't allow removing the last admin.
    if (target.role === "admin" && role !== "admin") {
      const admins = await prisma.user.count({ where: { role: "admin" } });
      if (admins <= 1) return res.status(400).json({ error: "Cannot demote the last admin" });
    }
    data.role = role;
  }
  if (password !== undefined) {
    const pwIssues = passwordIssues(password);
    if (pwIssues.length) return res.status(400).json({ error: `Password needs ${pwIssues.join(", ")}` });
    data.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({ where: { id }, data });
  audit(req.user.id, "USER_UPDATED", `${user.email}`);
  res.json({ user: publicUser(user) });
}

// DELETE /api/users/:id  (admin)
async function remove(req, res) {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: "You cannot delete your own account" });
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target.role === "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) return res.status(400).json({ error: "Cannot delete the last admin" });
  }
  await prisma.user.delete({ where: { id } }); // documents cascade-delete
  audit(req.user.id, "USER_DELETED", `${target.email}`);
  res.json({ ok: true });
}

module.exports = { list, create, update, remove };
