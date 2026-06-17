import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = {
  student: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/upload", label: "Upload" },
    { to: "/documents", label: "My Documents" },
  ],
  admin: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/review", label: "Documents" },
    { to: "/users", label: "Users" },
  ],
  counsellor: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/review", label: "Documents" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const links = LINKS[user?.role] || [];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm text-white">SD</span>
          <span className="hidden sm:inline">Student Docs</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto text-sm">
          {links.map((l) => {
            const active = loc.pathname === l.to;
            return (
              <Link key={l.to} to={l.to}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 transition-colors hover:bg-slate-100 ${active ? "bg-slate-100 font-medium" : "text-slate-600"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{user?.name} · <span className="capitalize">{user?.role}</span></span>
          <button className="btn-outline" onClick={() => { logout(); nav("/login"); }}>Logout</button>
        </div>
      </div>
    </header>
  );
}
