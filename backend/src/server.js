"use strict";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Lightweight health check (used by PM2 / Nginx / uptime monitors).
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/documents", require("./routes/documents.routes"));

app.use("/api", notFound);
app.use(errorHandler);

// Only listen when run directly (lets tests/tools require the app).
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`API listening on http://127.0.0.1:${config.port}`);
  });
}

module.exports = app;
