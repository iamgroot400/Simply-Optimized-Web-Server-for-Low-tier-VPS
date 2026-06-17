import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Spinner from "../components/Spinner.jsx";

export default function DocumentStatus() {
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState("");

  function load() { api.get("/api/documents/my").then((d) => setDocs(d.documents)).catch((e) => setError(e.message)); }
  useEffect(() => { load(); }, []);

  async function view(doc) {
    try { window.open(await api.fileObjectUrl(`/api/documents/${doc.id}/file`), "_blank"); }
    catch (e) { setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My documents</h1>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {!docs && !error && <div className="flex justify-center py-12 text-brand"><Spinner className="h-6 w-6" /></div>}
      {docs && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr><th className="px-4 py-2">File</th><th className="px-4 py-2">Uploaded</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Remarks</th><th className="px-4 py-2"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No documents uploaded yet.</td></tr>}
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-medium">{d.fileName}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{d.remarks || "—"}</td>
                  <td className="px-4 py-3 text-right"><button className="btn-outline" onClick={() => view(d)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
