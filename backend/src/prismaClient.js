"use strict";
const { PrismaClient } = require("@prisma/client");

// Single shared client instance (keeps connections low on a 1GB VPS).
const prisma = new PrismaClient({ log: ["error", "warn"] });

module.exports = prisma;
