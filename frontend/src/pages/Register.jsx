import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await register(form.name, form.email, form.password); nav("/dashboard"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">SD</div>
          <h1 className="text-lg font-semibold">Create your account</h1>
          <p className="text-sm text-slate-500">Student registration</p>
        </div>
        {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Full name</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required autoFocus /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
            <p className="mt-1 text-xs text-slate-400">At least 8 characters, with a letter and a number.</p>
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading && <Spinner className="h-4 w-4" />}Create account</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
