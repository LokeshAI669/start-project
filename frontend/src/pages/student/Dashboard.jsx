import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';


const statusBadge = (s) => {
  if (s === 'Accepted') return <span className="badge badge-accepted">Accepted</span>;
  if (s === 'Denied')   return <span className="badge badge-denied">Denied</span>;
  return <span className="badge badge-pending">Pending</span>;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtCurrency = (c, b) => `${c || '₹'}${Number(b).toLocaleString('en-IN')}`;

export default function Dashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError]   = useState('');
  const [theme, setTheme]   = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role === 'admin') { navigate('/admin'); return; }
    fetchRequests();
  }, [token, navigate, user?.role]);

  const fetchRequests = async () => {
    try {
      const data = await api('GET', '/api/requests/mine');
      setRequests(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };


  const total    = requests.length;
  const pending  = requests.filter(r => r.status === 'Pending').length;
  const accepted = requests.filter(r => r.status === 'Accepted').length;
  const denied   = requests.filter(r => r.status === 'Denied').length;

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/dashboard"><JobZenLogo theme={theme} size="sm" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-item active">
             My Requests
          </Link>
          <Link to="/request" className="sidebar-item">
             New Request
          </Link>
          <Link to="/browse" className="sidebar-item">
             Projects
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'S'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-item" style={{width:'100%',background:'none',border:'none',cursor:'pointer',color:'var(--red)',marginTop:'8px'}}>
             Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <div className="topbar">
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <button 
              className="mobile-menu-btn" 
              onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
              style={{background:'none',border:'none',color:'var(--text-primary)',fontSize:'1.5rem',cursor:'pointer'}}
            >
              ☰
            </button>
            <div>
              <h1 className="page-title">My Requests</h1>
              <p style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'2px'}}>Track all your project submissions</p>
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <Link to="/request" className="btn btn-primary btn-sm"> New Request</Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="dashboard-stats" style={{gap:'16px',marginBottom:'28px'}}>
          {[
            { label:'Total', value: total,    color:'var(--text-primary)' },
            { label:'Pending',  value: pending,  color:'var(--gold)' },
            { label:'Accepted', value: accepted, color:'var(--green)' },
            { label:'Denied',   value: denied,   color:'var(--red)' },
          ].map(s => (
            <div key={s.label} className="card" style={{padding:'20px 22px',textAlign:'center'}}>
              <div style={{fontSize:'2rem',fontWeight:700,color:s.color,letterSpacing:'-0.02em'}}>{s.value}</div>
              <div style={{fontSize:'12px',fontWeight:500,color:'var(--text-faint)',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Requests list */}
        {loading && <div style={{textAlign:'center',padding:'60px',color:'var(--text-faint)'}}>Loading...</div>}
        {error   && <div className="form-error show">{error}</div>}
        {!loading && !error && requests.length === 0 && (
          <div className="card" style={{textAlign:'center',padding:'60px 30px'}}>
            <div style={{fontSize:'3rem',marginBottom:'16px'}}></div>
            <h3 style={{marginBottom:'8px'}}>No requests yet</h3>
            <p style={{color:'var(--text-faint)',marginBottom:'24px'}}>Submit your first project request and get it reviewed.</p>
            <Link to="/request" className="btn btn-primary">Submit a Request →</Link>
          </div>
        )}
        {!loading && requests.length > 0 && (
          <div className="card table-responsive" style={{padding:0, overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Budget</th>
                  <th>Meeting Date</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{fontWeight:600}}>{r.project_name}</td>
                    <td>{fmtCurrency(r.currency, r.budget)}</td>
                    <td>{fmtDate(r.preferred_date)} · {r.preferred_time}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{color:'var(--text-faint)',fontSize:'12px'}}>{fmtDate(r.created_at)}</td>
                    <td>
                      <Link to={`/project?id=${r.id}`} className="btn btn-ghost btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
