// Minimal fetch wrapper: injects the JWT and normalizes errors. No axios.
const BASE = import.meta.env.VITE_API_BASE || "";

let token = localStorage.getItem("sdt_token") || null;

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("sdt_token", t);
  else localStorage.removeItem("sdt_token");
}
export function getToken() { return token; }

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
  patch: (p, body) => request(p, { method: "PATCH", body }),
  del: (p) => request(p, { method: "DELETE" }),
  upload: (p, formData) => request(p, { method: "POST", body: formData, isForm: true }),
  // Fetches a protected file with the auth header and returns an object URL.
  async fileObjectUrl(path) {
    const res = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error(`Could not load file (${res.status})`);
    return URL.createObjectURL(await res.blob());
  },
};
