import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded pages — loaded on demand, not all at once.
// This dramatically reduces the initial JS bundle size on mobile.
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const Login          = lazy(() => import('./pages/auth/Login'));
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard      = lazy(() => import('./pages/student/Dashboard'));
const ProjectDetails = lazy(() => import('./pages/student/ProjectDetails'));
const SubmitRequest  = lazy(() => import('./pages/student/SubmitRequest'));
const BrowseCatalog  = lazy(() => import('./pages/student/BrowseCatalog'));
const CatalogDetail  = lazy(() => import('./pages/student/CatalogDetail'));
const AdminLogin     = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCatalog   = lazy(() => import('./pages/admin/AdminCatalog'));
const NotFound       = lazy(() => import('./pages/NotFound'));

// Simple full-screen spinner shown while a lazy page chunk loads
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg, #09090B)',
    }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid rgba(59,130,246,0.2)',
        borderTopColor: 'var(--orange, #3B82F6)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

/* Separate component so useLocation works inside BrowserRouter */
function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <Routes>
        {/* ── Public ────────────────────────────────────── */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── Student ────────────────────────────────────── */}
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/request"        element={<SubmitRequest />} />
        <Route path="/browse"         element={<BrowseCatalog />} />
        <Route path="/catalog/:id"    element={<CatalogDetail />} />
        <Route path="/project"        element={<ProjectDetails />} />

        {/* ── Admin ────────────────────────────────────── */}
        <Route path="/hireproject_admin"  element={<AdminLogin />} />
        <Route path="/admin/dashboard"    element={<AdminDashboard />} />
        <Route path="/admin/catalog"      element={<AdminCatalog />} />

        {/* ── 404 — catches all unknown URLs ─────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
