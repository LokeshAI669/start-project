import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
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
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-requests" element={<Dashboard />} />

          <Route path="/request" element={<SubmitRequest />} />
          <Route path="/submit-request" element={<SubmitRequest />} />
          <Route path="/hire-project" element={<SubmitRequest />} />
          <Route path="/hire_project" element={<SubmitRequest />} />

          <Route path="/browse" element={<BrowseCatalog />} />
          <Route path="/projects" element={<BrowseCatalog />} />
          <Route path="/catalog" element={<BrowseCatalog />} />

          <Route path="/project" element={<ProjectDetails />} />
          <Route path="/project-details" element={<ProjectDetails />} />
          
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/catalog" element={<AdminCatalog />} />

          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
