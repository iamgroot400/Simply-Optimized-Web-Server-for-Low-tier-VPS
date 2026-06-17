import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "../api/client.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const d = await api.post("/api/auth/login", { email, password });
    setToken(d.token); setUser(d.user); return d.user;
  }
  async function register(name, email, password) {
    const d = await api.post("/api/auth/register", { name, email, password });
    setToken(d.token); setUser(d.user); return d.user;
  }
  function logout() { setToken(null); setUser(null); }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
