import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/documents/all").then((d) => setDocs(d.documents)).catch((e) => setError(e.message));
  }, []);

  const counts = (docs || []).reduce((a, d) => ((a[d.status] = (a[d.status] || 0) + 1), a), {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviewer dashboard</h1>
        <p className="text-slate-500">Welcome, {user?.name}. Review and verify submitted documents.</p>
      </div>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {!docs && !error && <div className="flex justify-center py-12 text-brand"><Spinner className="h-6 w-6" /></div>}
      {docs && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[["Total", docs.length], ["Pending", counts.pending || 0], ["Approved", counts.approved || 0], ["Rejected", counts.rejected || 0]].map(([label, n]) => (
              <div key={label} className="card p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{n}</p></div>
            ))}
          </div>
          <Link to="/review" className="btn-primary inline-flex">Go to document review</Link>
        </>
      )}
    </div>
  );
}
