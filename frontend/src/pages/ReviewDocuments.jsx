import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Spinner from "../components/Spinner.jsx";

export default function ReviewDocuments() {
  const [docs, setDocs] = useState(null);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [active, setActive] = useState(null); // doc being reviewed
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    const qs = new URLSearchParams();
    if (status !== "ALL") qs.set("status", status);
    if (search) qs.set("search", search);
    api.get(`/api/documents/all?${qs}`).then((d) => setDocs(d.documents)).catch((e) => setError(e.message));
  }
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [status, search]);

  async function view(doc) {
    try { window.open(await api.fileObjectUrl(`/api/documents/${doc.id}/file`), "_blank"); }
    catch (e) { setError(e.message); }
  }

  async function setDocStatus(doc, newStatus) {
    if (newStatus === "rejected" && !remarks.trim()) { setError("Remarks are required when rejecting."); return; }
    setSaving(true); setError("");
    try {
      await api.patch(`/api/documents/${doc.id}/status`, { status: newStatus, remarks: remarks || null });
      setActive(null); setRemarks(""); load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Document review</h1>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search by student name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[10rem]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {!docs && !error && <div className="flex justify-center py-12 text-brand"><Spinner className="h-6 w-6" /></div>}
      {docs && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr><th className="px-4 py-2">Student</th><th className="px-4 py-2">File</th><th className="px-4 py-2">Uploaded</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No documents.</td></tr>}
              {docs.map((d) => (
                <tr key={d.id} className="align-top">
                  <td className="px-4 py-3"><div className="font-medium">{d.user?.name}</div><div className="text-xs text-slate-500">{d.user?.email}</div></td>
                  <td className="px-4 py-3">{d.fileName}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} />{d.remarks && <div className="mt-1 text-xs text-slate-500">{d.remarks}</div>}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className="btn-outline" onClick={() => view(d)}>View</button>
                      <button className="btn-outline" onClick={() => { setActive(active === d.id ? null : d.id); setRemarks(d.remarks || ""); }}>Review</button>
                    </div>
                    {active === d.id && (
                      <div className="mt-2 w-64 space-y-2 rounded-lg border border-slate-200 p-2">
                        <textarea className="input" rows={2} placeholder="Remarks (required to reject)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        <div className="flex gap-2">
                          <button className="btn-primary flex-1" disabled={saving} onClick={() => setDocStatus(d, "approved")}>Approve</button>
                          <button className="btn-danger flex-1" disabled={saving} onClick={() => setDocStatus(d, "rejected")}>Reject</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
