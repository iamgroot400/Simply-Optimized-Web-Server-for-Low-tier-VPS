import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

const ROLES = ["student", "counsellor", "admin"];

export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function load() {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (roleFilter !== "ALL") qs.set("role", roleFilter);
    api.get(`/api/users?${qs}`).then((d) => setUsers(d.users)).catch((e) => setError(e.message));
  }
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [search, roleFilter]);

  async function createUser(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try { await api.post("/api/users", form); setShowCreate(false); setForm({ name: "", email: "", password: "", role: "student" }); load(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function changeRole(u, role) {
    setError("");
    try { await api.patch(`/api/users/${u.id}`, { role }); load(); }
    catch (err) { setError(err.message); }
  }
  async function remove(u) {
    if (!confirm(`Delete ${u.name} (${u.email})? This removes their documents too.`)) return;
    setError("");
    try { await api.del(`/api/users/${u.id}`); load(); }
    catch (err) { setError(err.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">User management</h1>
        <button className="btn-primary" onClick={() => setShowCreate((s) => !s)}>{showCreate ? "Close" : "Create user"}</button>
      </div>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {showCreate && (
        <form onSubmit={createUser} className="card grid gap-3 p-4 sm:grid-cols-2">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required /></div>
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><button className="btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4" />}Create user</button></div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[10rem]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {!users && !error && <div className="flex justify-center py-12 text-brand"><Spinner className="h-6 w-6" /></div>}
      {users && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Role</th><th className="px-4 py-2">Docs</th><th className="px-4 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No users found.</td></tr>}
              {users.map((u) => {
                const isSelf = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">{u.name}{isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select className="input h-8 w-36 py-0" value={u.role} disabled={isSelf} onChange={(e) => changeRole(u, e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u._count?.documents ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      {!isSelf && <button className="btn-danger" onClick={() => remove(u)}>Delete</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
