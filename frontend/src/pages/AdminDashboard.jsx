import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Spinner from "../components/Spinner.jsx";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/api/users"), api.get("/api/documents/all")])
      .then(([u, d]) => setData({ users: u.users, docs: d.documents }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>;
  if (!data) return <div className="flex justify-center py-12 text-brand"><Spinner className="h-6 w-6" /></div>;

  const dc = data.docs.reduce((a, d) => ((a[d.status] = (a[d.status] || 0) + 1), a), {});
  const roles = data.users.reduce((a, u) => ((a[u.role] = (a[u.role] || 0) + 1), a), {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="text-slate-500">Overview of users and document submissions.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[["Users", data.users.length], ["Pending docs", dc.pending || 0], ["Approved", dc.approved || 0], ["Rejected", dc.rejected || 0]].map(([label, n]) => (
          <div key={label} className="card p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{n}</p></div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <p className="mb-2 font-medium">Users by role</p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Students: <b>{roles.student || 0}</b></li>
            <li>Counsellors: <b>{roles.counsellor || 0}</b></li>
            <li>Admins: <b>{roles.admin || 0}</b></li>
          </ul>
        </div>
        <div className="card flex flex-col items-start gap-3 p-4">
          <p className="font-medium">Quick actions</p>
          <Link to="/users" className="btn-primary">Manage users</Link>
          <Link to="/review" className="btn-outline">Review documents</Link>
        </div>
      </div>
    </div>
  );
}
