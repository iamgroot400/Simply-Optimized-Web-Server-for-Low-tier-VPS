import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) { nav("/dashboard", { replace: true }); return null; }

  async function submit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(email, password); nav("/dashboard"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">SD</div>
          <h1 className="text-lg font-semibold">Student Document Tracker</h1>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>
        {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading && <Spinner className="h-4 w-4" />}Sign in</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          New student? <Link to="/register" className="font-medium text-brand hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
