import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JobZenLogo from './JobZenLogo';
import { LayoutDashboard, PlusCircle, FolderKanban, Menu, X } from 'lucide-react';

export default function StudentLayout({ children, title, subtitle }) {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  // Close sidebar on mobile navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!token) return null;

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* ── Mobile Sidebar Overlay Backdrop ── */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Left Sidebar Navigation ── */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" onClick={closeSidebar} className="sidebar-logo-link">
            <JobZenLogo theme={theme} size="sm" />
          </Link>
          <button 
            className="sidebar-close-btn" 
            onClick={toggleSidebar}
            aria-label="Close Navigation Menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard className="sidebar-icon" size={18} />
            <span>My Requests</span>
          </Link>

          <Link 
            to="/request" 
            className={`sidebar-item ${location.pathname === '/request' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <PlusCircle className="sidebar-icon" size={18} />
            <span>New Request</span>
          </Link>

          <Link 
            to="/browse" 
            className={`sidebar-item ${location.pathname === '/browse' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FolderKanban className="sidebar-icon" size={18} />
            <span>Projects</span>
          </Link>
        </nav>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="main-content">
        {/* Sticky Top Header */}
        <header className="topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-btn" 
              onClick={toggleSidebar}
              aria-label="Toggle Navigation Drawer"
            >
              <Menu size={22} />
            </button>
            
            <div className="topbar-title-group">
              <h1 className="page-title">{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="topbar-right">
            <button 
              onClick={() => navigate('/profile')} 
              className="topbar-profile-btn" 
              title={user?.name || "Profile"}
              aria-label="User Profile"
            >
              <span className="profile-avatar-initial">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </button>
          </div>
        </header>
        
        {/* Body Content */}
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
