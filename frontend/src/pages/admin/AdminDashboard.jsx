import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';
import { LogOut } from 'lucide-react';


const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtCurrency = (c, b) => `${c || '₹'}${Number(b).toLocaleString('en-IN')}`;
const statusBadge = (s) => {
  if (s === 'Accepted') return <span className="badge badge-accepted">Accepted</span>;
  if (s === 'Denied')   return <span className="badge badge-denied">Denied</span>;
  return <span className="badge badge-pending">Pending</span>;
};

export default function AdminDashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter]     = useState('All');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [confDate, setConfDate]   = useState('');
  const [confTime, setConfTime]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decisionMsg, setDecisionMsg] = useState('');
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchAll();
  }, [token, navigate, user?.role]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reqs, st] = await Promise.all([
        api('GET', '/api/requests/all'),
        api('GET', '/api/requests/stats'),
      ]);
      setRequests(reqs);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchFilter = filter === 'All' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.student_name?.toLowerCase().includes(q) || r.project_name?.toLowerCase().includes(q) || r.student_email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleDecision = async (e) => {
    e.preventDefault();
    if (!decision) return setDecisionMsg('Select a decision.');
    setSubmitting(true); setDecisionMsg('');
    try {
      await api('PATCH', `/api/requests/${selected.id}/decision`, {
        decision,
        admin_note: adminNote || undefined,
        confirmed_date: decision === 'accepted' ? (confDate || undefined) : undefined,
        confirmed_time: decision === 'accepted' ? (confTime || undefined) : undefined,
      });
      setSelected(null); setDecision(''); setAdminNote(''); setConfDate(''); setConfTime('');
      await fetchAll();
    } catch (e) {
      setDecisionMsg(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = `http://localhost:3000/api/requests/export`;
    const headers = new Headers({ 'Authorization': `Bearer ${token}` });
    fetch(link.href, { headers }).then(res => res.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      link.href = url; link.download = 'jobzen-projects.csv'; link.click(); URL.revokeObjectURL(url);
    });
  };

  const handleLogout = () => { logout(); navigate('/'); };


  return (
    <div className="app-layout admin-portal">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <JobZenLogo theme={theme} size="sm" />
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-item active"> All Requests</Link>
          <Link to="/admin/catalog" className="sidebar-item"> Manage Catalog</Link>
        </nav>
        <div className="sidebar-footer-compact">
          <div className="compact-user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div className="compact-user-info">
            <div className="compact-user-name">{user?.name}</div>
            <div className="compact-user-email">{user?.email}</div>
          </div>
          <button className="compact-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
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
              <h1 className="page-title">Admin Dashboard</h1>
              <p style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'2px'}}>Review and manage all student project requests</p>
            </div>
          </div>
          <button onClick={handleExport} className="btn btn-ghost btn-sm"> Export CSV</button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="dashboard-stats" style={{gap:'14px',marginBottom:'28px'}}>
            {[
              { label:'Total',    value: stats.total,    color:'var(--text-primary)' },
              { label:'Pending',  value: stats.pending,  color:'var(--gold)' },
              { label:'Accepted', value: stats.accepted, color:'var(--green)' },
              { label:'Denied',   value: stats.denied,   color:'var(--red)' },
              { label:'Students', value: stats.students, color:'var(--blue)' },
            ].map(s => (
              <div key={s.label} className="card" style={{padding:'18px 20px',textAlign:'center'}}>
                <div style={{fontSize:'1.8rem',fontWeight:700,color:s.color,letterSpacing:'-0.02em'}}>{s.value}</div>
                <div style={{fontSize:'12px',fontWeight:500,color:'var(--text-faint)',marginTop:'4px',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
          <input className="form-input" style={{flex:1,minWidth:'200px',maxWidth:'320px'}} placeholder="Search by name, email, project..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{display:'flex',gap:'8px'}}>
            {['All','Pending','Accepted','Denied'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter===f ? 'btn-primary' : 'btn-ghost'}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-faint)'}}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'60px'}}>
            <p style={{color:'var(--text-faint)'}}>No requests match your filters.</p>
          </div>
        ) : (
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Project</th>
                  <th>Budget</th>
                  <th>Meeting</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{fontWeight:600,fontSize:'13px'}}>{r.student_name}</div>
                      <div style={{fontSize:'11px',color:'var(--text-faint)'}}>{r.student_email}</div>
                    </td>
                    <td style={{fontWeight:600,fontSize:'13px'}}>{r.project_name}</td>
                    <td style={{fontSize:'13px'}}>{fmtCurrency(r.currency, r.budget)}</td>
                    <td style={{fontSize:'12px',color:'var(--text-faint)'}}>{fmtDate(r.preferred_date)} {r.preferred_time}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{fontSize:'11px',color:'var(--text-faint)'}}>{fmtDate(r.created_at)}</td>
                    <td>
                      {r.status === 'Pending' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => { setSelected(r); setDecision(''); setAdminNote(''); setConfDate(r.preferred_date || ''); setConfTime(r.preferred_time || ''); setDecisionMsg(''); }}>
                          Review
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setDecision(''); setAdminNote(''); setDecisionMsg(''); }}>
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Decision Modal */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => setSelected(null)}>
          <div className="card" style={{width:'100%',maxWidth:'520px',padding:'32px',maxHeight:'90vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0,marginBottom:'4px'}}>{selected.project_name}</h3>
            <div style={{fontSize:'12px',color:'var(--text-faint)',marginBottom:'20px'}}>
              {selected.student_name} · {selected.student_email}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'20px'}}>
              <div style={{background:'var(--bg-elevated)',borderRadius:'8px',padding:'12px 14px'}}>
                <div style={{fontSize:'10px',color:'var(--text-faint)',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'.06em',fontFamily:'JetBrains Mono,monospace'}}>Budget</div>
                <div style={{fontWeight:700,color:'var(--orange)'}}>{fmtCurrency(selected.currency, selected.budget)}</div>
              </div>
              <div style={{background:'var(--bg-elevated)',borderRadius:'8px',padding:'12px 14px'}}>
                <div style={{fontSize:'10px',color:'var(--text-faint)',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'.06em',fontFamily:'JetBrains Mono,monospace'}}>Requested Meeting</div>
                <div style={{fontWeight:600,fontSize:'13px'}}>{fmtDate(selected.preferred_date)} {selected.preferred_time}</div>
              </div>
            </div>

            <div style={{background:'var(--bg-elevated)',borderRadius:'8px',padding:'14px',marginBottom:'20px',fontSize:'13px',lineHeight:'1.6',color:'var(--text-secondary)'}}>
              {selected.description}
            </div>

            {selected.status !== 'Pending' ? (
              <div style={{textAlign:'center',padding:'20px'}}>
                <div style={{marginBottom:'8px'}}>{statusBadge(selected.status)}</div>
                {selected.admin_note && <p style={{color:'var(--text-faint)',fontSize:'13px'}}>Note: {selected.admin_note}</p>}
                <button className="btn btn-ghost" onClick={() => setSelected(null)} style={{marginTop:'12px'}}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleDecision}>
                <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
                  <button type="button" onClick={() => setDecision('accepted')} className={`btn btn-sm ${decision==='accepted' ? 'btn-primary' : 'btn-ghost'}`} style={{flex:1, ...(decision==='accepted'?{background:'var(--green)',borderColor:'var(--green)'}:{})}}>
                     Accept
                  </button>
                  <button type="button" onClick={() => setDecision('denied')} className={`btn btn-sm ${decision==='denied' ? 'btn-primary' : 'btn-ghost'}`} style={{flex:1, ...(decision==='denied'?{background:'var(--red)',borderColor:'var(--red)'}:{})}}>
                     Deny
                  </button>
                </div>

                {decision === 'accepted' && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
                    <div className="form-group" style={{marginBottom:0}}>
                      <label className="form-label">Confirm Date</label>
                      <input type="date" className="form-input" value={confDate} onChange={e => setConfDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{marginBottom:0}}>
                      <label className="form-label">Confirm Time</label>
                      <input type="time" className="form-input" value={confTime} onChange={e => setConfTime(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Admin Note <span style={{color:'var(--text-faint)',fontWeight:400}}>(optional)</span></label>
                  <textarea className="form-input" rows={3} style={{resize:'vertical'}} placeholder="Add a note for the student..." value={adminNote} onChange={e => setAdminNote(e.target.value)} />
                </div>

                {decisionMsg && <div className="form-error show" style={{marginBottom:'12px'}}>{decisionMsg}</div>}

                <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
                  <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || !decision}>
                    {submitting ? 'Saving...' : 'Submit Decision'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
