import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage    from './pages/LandingPage';
import Login          from './pages/auth/Login';
import ResetPassword  from './pages/auth/ResetPassword';
import Dashboard      from './pages/student/Dashboard';
import ProjectDetails from './pages/student/ProjectDetails';
import SubmitRequest  from './pages/student/SubmitRequest';
import BrowseCatalog  from './pages/student/BrowseCatalog';
import CatalogDetail  from './pages/student/CatalogDetail';
import AdminLogin     from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCatalog   from './pages/admin/AdminCatalog';
import NotFound       from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────── */}
          <Route path="/"               element={<LandingPage />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Student ────────────────────────────── */}
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/request"        element={<SubmitRequest />} />
          <Route path="/browse"         element={<BrowseCatalog />} />
          <Route path="/catalog/:id"    element={<CatalogDetail />} />
          <Route path="/project"        element={<ProjectDetails />} />

          {/* ── Admin ──────────────────────────────── */}
          <Route path="/hireproject_admin"  element={<AdminLogin />} />
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
          <Route path="/admin/catalog"      element={<AdminCatalog />} />

          {/* ── 404 — catches all unknown URLs ─────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

