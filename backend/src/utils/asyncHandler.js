"use strict";
// Wraps an async route handler so thrown errors reach the central error handler.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
