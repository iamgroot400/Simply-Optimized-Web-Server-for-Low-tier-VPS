"use strict";
/**
 * Bootstraps the first admin account so you can log in and create other users.
 *
 * No hardcoded credentials: the password comes from SEED_ADMIN_PASSWORD, or a
 * strong random one is generated and printed ONCE. Re-running is safe — it skips
 * creation if the admin already exists.
 *
 *   SEED_ADMIN_EMAIL=admin@school.edu SEED_ADMIN_PASSWORD='Str0ngPass!' npm run seed
 */
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@school.edu").toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — nothing to do.`);
    return;
  }
  const password = process.env.SEED_ADMIN_PASSWORD || `Adm-${crypto.randomBytes(9).toString("base64url")}`;
  await prisma.user.create({
    data: { name: "Administrator", email, password: await bcrypt.hash(password, 10), role: "admin" },
  });
  console.log("Created initial admin:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log("Store this securely and change it after first login.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
