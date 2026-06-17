"use strict";
// Tiny dependency-free validation helpers (keeps the bundle lean).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(v) {
  return typeof v === "string" && EMAIL_RE.test(v.trim());
}

function isNonEmptyString(v, min = 1) {
  return typeof v === "string" && v.trim().length >= min;
}

const ROLES = ["student", "admin", "counsellor"];
const STATUSES = ["pending", "approved", "rejected"];

// Password policy: min 8 chars, at least one letter and one number.
function passwordIssues(pw) {
  const issues = [];
  if (typeof pw !== "string" || pw.length < 8) issues.push("at least 8 characters");
  if (!/[A-Za-z]/.test(pw || "")) issues.push("a letter");
  if (!/[0-9]/.test(pw || "")) issues.push("a number");
  return issues;
}

module.exports = { isEmail, isNonEmptyString, passwordIssues, ROLES, STATUSES };
