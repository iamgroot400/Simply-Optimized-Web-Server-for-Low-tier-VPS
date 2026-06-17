import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CounsellorDashboard from "./pages/CounsellorDashboard.jsx";
import UploadDocument from "./pages/UploadDocument.jsx";
import DocumentStatus from "./pages/DocumentStatus.jsx";
import ReviewDocuments from "./pages/ReviewDocuments.jsx";
import UserManagement from "./pages/UserManagement.jsx";

// Role-aware dashboard selector.
function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "counsellor") return <CounsellorDashboard />;
  return <StudentDashboard />;
}

const wrap = (node, roles) => (
  <ProtectedRoute roles={roles}><Layout>{node}</Layout></ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={wrap(<Dashboard />)} />
      <Route path="/upload" element={wrap(<UploadDocument />, ["student"])} />
      <Route path="/documents" element={wrap(<DocumentStatus />, ["student"])} />
      <Route path="/review" element={wrap(<ReviewDocuments />, ["admin", "counsellor"])} />
      <Route path="/users" element={wrap(<UserManagement />, ["admin"])} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
