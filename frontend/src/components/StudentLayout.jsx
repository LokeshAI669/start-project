import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JobZenLogo from './JobZenLogo';

export default function StudentLayout({ children, title, subtitle }) {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  // If sidebar is open on mobile and route changes, close the sidebar
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!token) return null;

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
          <Link to="/dashboard"><JobZenLogo theme={theme} size="sm" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
             My Requests
          </Link>
          <Link to="/request" className={`sidebar-item ${location.pathname === '/request' ? 'active' : ''}`}>
             New Request
          </Link>
          <Link to="/browse" className={`sidebar-item ${location.pathname === '/browse' ? 'active' : ''}`}>
             Projects
          </Link>
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="main-content" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <div className="topbar" style={{ position: 'relative' }}>
          <div style={{display:'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center', gap:'16px', paddingRight:'50px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
              <button 
                className="mobile-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
                style={{background:'none',border:'none',color:'var(--text-primary)',fontSize:'1.5rem',cursor:'pointer',marginTop:'-4px'}}
              >
                ☰
              </button>
              <Link to="/dashboard" style={{ display: window.innerWidth <= 768 ? 'block' : 'none' }}><JobZenLogo theme={theme} size="sm" /></Link>
            </div>
            <div>
              <h1 className="page-title" style={{margin:0}}>{title}</h1>
              {subtitle && <p style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'2px',marginBottom:0}}>{subtitle}</p>}
            </div>
          </div>
          <div style={{position:'absolute', top:0, right:0}}>
            <button onClick={() => navigate('/profile')} className="topbar-profile-btn" title="Profile">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
          </div>
        </div>
        
        {/* Child Content rendered below topbar */}
        <div style={{marginTop: '20px'}}>
          {children}
        </div>
      </main>
    </div>
  );
}
