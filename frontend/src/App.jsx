import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/student/Dashboard';
import ProjectDetails from './pages/student/ProjectDetails';
import SubmitRequest from './pages/student/SubmitRequest';
import BrowseCatalog from './pages/student/BrowseCatalog';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCatalog from './pages/admin/AdminCatalog';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project" element={<ProjectDetails />} />
          <Route path="/request" element={<SubmitRequest />} />
          <Route path="/browse" element={<BrowseCatalog />} />
          
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/catalog" element={<AdminCatalog />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
