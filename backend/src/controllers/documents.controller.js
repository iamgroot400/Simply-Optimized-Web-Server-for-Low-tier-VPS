"use strict";
const path = require("path");
const fs = require("fs");
const prisma = require("../prismaClient");
const { STATUSES } = require("../utils/validate");
const { uploadRoot } = require("../middleware/upload");

const publicDoc = (d) => ({
  id: d.id,
  fileName: d.fileName,
  fileUrl: d.fileUrl,
  mimeType: d.mimeType,
  sizeBytes: d.sizeBytes,
  status: d.status,
  remarks: d.remarks,
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
  reviewedAt: d.reviewedAt,
  user: d.user ? { id: d.user.id, name: d.user.name, email: d.user.email } : undefined,
});

function audit(actorId, action, detail) {
  prisma.auditLog.create({ data: { actorId, action, detail } }).catch(() => {});
}

// POST /api/documents/upload  (student) — multipart field "file".
async function upload(req, res) {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const created = await prisma.document.create({
    data: {
      userId: req.user.id,
      fileName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      fileUrl: "", // set below now that we have the id
    },
  });
  const doc = await prisma.document.update({
    where: { id: created.id },
    data: { fileUrl: `/api/documents/${created.id}/file` },
  });
  res.status(201).json({ document: publicDoc(doc) });
}

// GET /api/documents/my  (student) — caller's own documents.
async function listMine(req, res) {
  const documents = await prisma.document.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ documents: documents.map(publicDoc) });
}

// GET /api/documents/all  (admin/counsellor) — optional ?status= &search=
async function listAll(req, res) {
  const { status, search } = req.query;
  const where = {};
  if (status && STATUSES.includes(status)) where.status = status;
  if (search) {
    where.user = {
      OR: [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
      ],
    };
  }
  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json({ documents: documents.map(publicDoc) });
}

async function loadWithAccess(id, user) {
  const doc = await prisma.document.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, email: true } } } });
  if (!doc) return { error: 404 };
  // Students may only see their own; admin/counsellor see all.
  if (user.role === "student" && doc.userId !== user.id) return { error: 403 };
  return { doc };
}

// GET /api/documents/:id — metadata (owner or staff).
async function getOne(req, res) {
  const { doc, error } = await loadWithAccess(req.params.id, req.user);
  if (error) return res.status(error).json({ error: error === 404 ? "Not found" : "Forbidden" });
  res.json({ document: publicDoc(doc) });
}

// GET /api/documents/:id/file — stream the file with access control.
async function getFile(req, res) {
  const { doc, error } = await loadWithAccess(req.params.id, req.user);
  if (error) return res.status(error).json({ error: error === 404 ? "Not found" : "Forbidden" });

  // Resolve strictly inside uploadRoot to prevent traversal.
  const abs = path.resolve(uploadRoot, doc.storedName);
  if (!abs.startsWith(uploadRoot) || !fs.existsSync(abs)) {
    return res.status(404).json({ error: "File missing on disk" });
  }
  const disposition = req.query.download ? "attachment" : "inline";
  res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(doc.fileName)}"`);
  fs.createReadStream(abs).pipe(res);
}

// PATCH /api/documents/:id/status  (admin/counsellor) — set status + remarks.
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, remarks } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: "Status must be pending, approved, or rejected" });
  if (status === "rejected" && (!remarks || !String(remarks).trim())) {
    return res.status(400).json({ error: "Remarks are required when rejecting" });
  }
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const doc = await prisma.document.update({
    where: { id },
    data: { status, remarks: remarks ?? null, reviewedById: req.user.id, reviewedAt: new Date() },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  audit(req.user.id, "DOCUMENT_STATUS", `${doc.id} → ${status}`);
  res.json({ document: publicDoc(doc) });
}

module.exports = { upload, listMine, listAll, getOne, getFile, updateStatus };
