import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import Spinner from "../components/Spinner.jsx";

const MAX_MB = 10;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export default function UploadDocument() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function pick(f) {
    setError("");
    if (!f) return setFile(null);
    if (!ALLOWED.includes(f.type)) { setFile(null); return setError("Only PDF, JPG, PNG or WEBP files are allowed."); }
    if (f.size > MAX_MB * 1024 * 1024) { setFile(null); return setError(`File must be under ${MAX_MB}MB.`); }
    setFile(f);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return setError("Please choose a file.");
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api.upload("/api/documents/upload", fd);
      nav("/documents");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Upload a document</h1>
      <p className="text-slate-500">Accepted: PDF, JPG, PNG, WEBP — up to {MAX_MB}MB.</p>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="card space-y-4 p-5">
        <div>
          <label className="label">Document file</label>
          <input className="input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => pick(e.target.files?.[0])} />
        </div>
        {file && <p className="text-sm text-slate-600">Selected: <b>{file.name}</b> ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
        <button className="btn-primary w-full" disabled={loading || !file}>{loading && <Spinner className="h-4 w-4" />}Upload</button>
      </form>
    </div>
  );
}
