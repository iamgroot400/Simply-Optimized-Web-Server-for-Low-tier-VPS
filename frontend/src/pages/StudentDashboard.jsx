import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Spinner from "../components/Spinner.jsx";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/documents/my").then((d) => setDocs(d.documents)).catch((e) => setError(e.message));
  }, []);

  const counts = (docs || []).reduce((a, d) => ((a[d.status] = (a[d.status] || 0) + 1), a), {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
        <p className="text-slate-500">Track your submitted documents and their review status.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {!docs && !error && <div className="flex justify-center py-12 text-brand"><Spinner className="h-6 w-6" /></div>}

      {docs && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[["Total", docs.length], ["Pending", counts.pending || 0], ["Approved", counts.approved || 0], ["Rejected", counts.rejected || 0]].map(([label, n]) => (
              <div key={label} className="card p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{n}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/upload" className="btn-primary">Upload a document</Link>
            <Link to="/documents" className="btn-outline">View all my documents</Link>
          </div>

          <div className="card">
            <div className="border-b border-slate-200 px-4 py-3 font-medium">Recent uploads</div>
            <div className="divide-y divide-slate-100">
              {docs.length === 0 && <p className="px-4 py-6 text-sm text-slate-500">No documents yet.</p>}
              {docs.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="truncate font-medium">{d.fileName}</span>
                  <span className="ml-auto"><StatusBadge status={d.status} /></span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
