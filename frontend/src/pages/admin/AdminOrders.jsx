import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { 
  DollarSign, ShoppingCart, Users, Award, 
  Search, RefreshCw, Mail, RotateCcw, 
  CheckCircle2, Clock, XCircle, ArrowUpRight, ShieldCheck, History
} from 'lucide-react';

export default function AdminOrders() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/hireproject_admin');
      return;
    }
    if (user && user.role === 'admin') {
      fetchOrders();
      fetchStats();
    }
  }, [user, authLoading, navigate, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
      const s = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const data = await api('GET', `/api/admin/orders?limit=100${s}${q}`);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api('GET', '/api/admin/orders/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const data = await api('GET', '/api/admin/orders/audit-logs?limit=50');
      setAuditLogs(data || []);
      setShowAuditLogs(true);
    } catch (err) {
      alert('Failed to load audit logs: ' + err.message);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResendEmail = async (orderId) => {
    setProcessingId(orderId);
    setActionMessage({ text: '', type: '' });
    try {
      const res = await api('POST', `/api/admin/orders/${orderId}/resend-email`);
      setActionMessage({ text: res.message || 'Download email resent successfully!', type: 'success' });
    } catch (err) {
      setActionMessage({ text: err.message || 'Failed to resend email', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefund = async (orderId, projectTitle, amount) => {
    if (!window.confirm(`Issue refund of ₹${amount} for "${projectTitle}"? This will revoke download access and return funds via Razorpay.`)) {
      return;
    }
    setProcessingId(orderId);
    setActionMessage({ text: '', type: '' });
    try {
      const res = await api('POST', `/api/admin/orders/${orderId}/refund`);
      setActionMessage({ text: res.message || 'Refund issued successfully!', type: 'success' });
      await fetchOrders();
      await fetchStats();
    } catch (err) {
      setActionMessage({ text: err.message || 'Failed to issue refund', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="app-layout admin-portal">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ display: isNarrow ? 'none' : 'block' }}>
          <Link to="/admin/dashboard"><JobZenLogo theme={theme} size="sm" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="sidebar-item"> All Requests</Link>
          <Link to="/admin/catalog" className="sidebar-item"> Manage Catalog</Link>
          <Link to="/admin/orders" className="sidebar-item active">
            <span style={{ display:'inline-flex', alignItems:'center', gap:'8px' }}>
              <ShoppingCart size={15} /> Sales &amp; Orders
            </span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <div className="topbar" style={{ position: 'relative', marginBottom: '24px' }}>
          <div style={{display:'flex', flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'flex-start' : 'center', gap:'16px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
              <button 
                className="mobile-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
                style={{background:'none',border:'none',color:'var(--text-primary)',fontSize:'1.5rem',cursor:'pointer',marginTop:'-4px'}}
              >
                ☰
              </button>
              <Link to="/admin/dashboard" style={{ display: isNarrow ? 'block' : 'none' }}><JobZenLogo theme={theme} size="sm" /></Link>
            </div>
            <div>
              <h1 className="page-title">Sales &amp; Orders</h1>
              <p style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'2px'}}>
                Monitor premium purchases, revenue, deliverable access, and refunds.
              </p>
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <button className="btn btn-ghost btn-sm" onClick={fetchAuditLogs} style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
              <History size={14} /> Audit Logs
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { fetchOrders(); fetchStats(); }} title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage.text && (
          <div style={{
            padding:'12px 18px',
            borderRadius:'8px',
            marginBottom:'20px',
            fontSize:'13px',
            fontWeight:600,
            background: actionMessage.type === 'success' ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
            color: actionMessage.type === 'success' ? '#34D399' : '#EF4444',
            border: `1px solid ${actionMessage.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center'
          }}>
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage({ text: '', type: '' })} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button>
          </div>
        )}

        {/* Top KPI Metrics Cards */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',
          gap:'16px',
          marginBottom:'28px'
        }}>
          {/* Revenue */}
          <div className="card" style={{padding:'20px',position:'relative',overflow:'hidden'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600}}>
                Total Revenue
              </span>
              <span style={{padding:'6px',borderRadius:'8px',background:'rgba(52,211,153,0.12)',color:'#34D399'}}>
                <DollarSign size={18} />
              </span>
            </div>
            <div style={{fontSize:'26px',fontWeight:800,color:'var(--text-primary)'}}>
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'4px'}}>
              {stats?.totalSales || 0} completed transactions
            </div>
          </div>

          {/* Premium Sales */}
          <div className="card" style={{padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600}}>
                Total Sales
              </span>
              <span style={{padding:'6px',borderRadius:'8px',background:'rgba(245,158,11,0.12)',color:'#F59E0B'}}>
                <ShoppingCart size={18} />
              </span>
            </div>
            <div style={{fontSize:'26px',fontWeight:800,color:'var(--text-primary)'}}>
              {stats?.totalSales || 0}
            </div>
            <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'4px'}}>
              Avg Order Value: ₹{stats?.avgOrderValue || 0}
            </div>
          </div>

          {/* Unique Buyers */}
          <div className="card" style={{padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600}}>
                Unique Buyers
              </span>
              <span style={{padding:'6px',borderRadius:'8px',background:'rgba(37,99,235,0.12)',color:'#60A5FA'}}>
                <Users size={18} />
              </span>
            </div>
            <div style={{fontSize:'26px',fontWeight:800,color:'var(--text-primary)'}}>
              {stats?.uniqueBuyers || 0}
            </div>
            <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'4px'}}>
              Verified student purchases
            </div>
          </div>

          {/* Top Selling Project */}
          <div className="card" style={{padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:600}}>
                Top Selling Project
              </span>
              <span style={{padding:'6px',borderRadius:'8px',background:'rgba(168,85,247,0.12)',color:'#C084FC'}}>
                <Award size={18} />
              </span>
            </div>
            <div style={{fontSize:'15px',fontWeight:700,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
              {stats?.topProject?.title || 'No sales yet'}
            </div>
            <div style={{fontSize:'11px',color:'#34D399',marginTop:'4px',fontWeight:600}}>
              {stats?.topProject ? `${stats.topProject.sales_count} sales • ₹${Number(stats.topProject.total_generated).toLocaleString('en-IN')}` : 'Awaiting first premium sale'}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'12px',flexWrap:'wrap',marginBottom:'20px'}}>
          <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap',flex:'1'}}>
            {/* Status Filter Buttons */}
            {['all', 'paid', 'pending', 'refunded'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{textTransform:'capitalize',fontSize:'12px'}}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} style={{display:'flex',gap:'8px',minWidth:'280px'}}>
            <div style={{position:'relative',flex:1}}>
              <Search size={14} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-faint)'}} />
              <input
                className="form-input"
                style={{paddingLeft:'30px',height:'34px',fontSize:'12px'}}
                placeholder="Search buyer, project, payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-ghost btn-sm">Search</button>
          </form>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-faint)'}}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'60px'}}>
            <p style={{color:'var(--text-faint)',margin:0}}>No sales orders found matching current filters.</p>
          </div>
        ) : (
          <div className="card" style={{padding:0,overflow:'hidden',width:'100%'}}>
            <div className="table-responsive" style={{width:'100%',overflowX:'auto'}}>
              <table className="data-table" style={{minWidth:'940px',width:'100%'}}>
                <thead>
                  <tr>
                    <th style={{width:'180px'}}>Date &amp; ID</th>
                    <th style={{width:'220px'}}>Buyer</th>
                    <th style={{width:'240px'}}>Project</th>
                    <th style={{width:'100px'}}>Amount</th>
                    <th style={{width:'110px'}}>Status</th>
                    <th style={{width:'110px'}}>Downloads</th>
                    <th style={{width:'150px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const isPaid = o.status === 'paid';
                    const isRefunded = o.status === 'refunded';
                    return (
                      <tr key={o.id}>
                        <td>
                          <div style={{fontWeight:600,fontSize:'12px',color:'var(--text-primary)'}}>
                            {new Date(o.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                          </div>
                          <div style={{fontSize:'10px',fontFamily:'JetBrains Mono,monospace',color:'var(--text-faint)'}}>
                            #{o.id} • {o.razorpay_payment_id || o.razorpay_order_id.slice(-8)}
                          </div>
                        </td>
                        <td>
                          <div style={{fontWeight:600,fontSize:'13px'}}>{o.user_name || 'Student'}</div>
                          <div style={{fontSize:'11px',color:'var(--text-faint)',fontFamily:'JetBrains Mono,monospace'}}>{o.user_email}</div>
                        </td>
                        <td>
                          <div style={{fontWeight:600,fontSize:'13px',color:'var(--text-primary)'}}>{o.project_title || `Project #${o.project_id}`}</div>
                          <div style={{fontSize:'10px',color:'#F59E0B',fontFamily:'JetBrains Mono,monospace'}}>{o.project_domain} • v{o.zip_version_purchased}</div>
                        </td>
                        <td style={{fontWeight:700,fontSize:'14px',color: isPaid ? '#34D399' : isRefunded ? 'var(--text-faint)' : 'var(--orange)'}}>
                          ₹{Number(o.amount).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span style={{
                            fontSize:'10px',
                            fontWeight:700,
                            textTransform:'uppercase',
                            padding:'3px 8px',
                            borderRadius:'4px',
                            background: isPaid ? 'rgba(52,211,153,0.12)' : isRefunded ? 'rgba(168,85,247,0.12)' : 'rgba(245,158,11,0.12)',
                            color: isPaid ? '#34D399' : isRefunded ? '#C084FC' : '#F59E0B',
                            border: `1px solid ${isPaid ? 'rgba(52,211,153,0.3)' : isRefunded ? 'rgba(168,85,247,0.3)' : 'rgba(245,158,11,0.3)'}`
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <span style={{fontSize:'12px',fontFamily:'JetBrains Mono,monospace',color: o.download_count >= o.max_downloads ? 'var(--red)' : 'var(--text-secondary)'}}>
                            {o.download_count} / {o.max_downloads}
                          </span>
                        </td>
                        <td>
                          <div style={{display:'flex',gap:'6px'}}>
                            {isPaid && (
                              <>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  title="Resend download confirmation email"
                                  onClick={() => handleResendEmail(o.id)}
                                  disabled={processingId === o.id}
                                  style={{padding:'4px 8px',fontSize:'11px',display:'inline-flex',alignItems:'center',gap:'4px'}}
                                >
                                  <Mail size={12} /> Email
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  title="Refund purchase"
                                  onClick={() => handleRefund(o.id, o.project_title, o.amount)}
                                  disabled={processingId === o.id}
                                  style={{padding:'4px 8px',fontSize:'11px',color:'var(--red)',display:'inline-flex',alignItems:'center',gap:'4px'}}
                                >
                                  <RotateCcw size={12} /> Refund
                                </button>
                              </>
                            )}
                            {!isPaid && (
                              <span style={{fontSize:'11px',color:'var(--text-faint)'}}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Logs Modal */}
        {showAuditLogs && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)'}} onClick={() => setShowAuditLogs(false)}>
            <div className="card" style={{width:'100%',maxWidth:'800px',padding:'28px',maxHeight:'85vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',borderBottom:'1px solid var(--border)',paddingBottom:'14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <History size={18} style={{color:'#60A5FA'}} />
                  <h3 style={{margin:0,fontSize:'17px'}}>Admin Audit Trail</h3>
                </div>
                <button onClick={() => setShowAuditLogs(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-faint)'}}>✕</button>
              </div>

              {auditLogs.length === 0 ? (
                <p style={{color:'var(--text-faint)',textAlign:'center',padding:'30px'}}>No audit log records recorded yet.</p>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  {auditLogs.map((log) => (
                    <div key={log.id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',borderRadius:'6px',padding:'12px 14px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                        <span style={{fontSize:'11px',fontFamily:'JetBrains Mono,monospace',color:'#60A5FA',fontWeight:700}}>
                          {log.action}
                        </span>
                        <span style={{fontSize:'11px',color:'var(--text-faint)'}}>
                          {new Date(log.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>
                        Triggered by: <strong>{log.user_email}</strong> {log.entity_id ? `• Entity ID: ${log.entity_id}` : ''}
                      </div>
                      {log.new_values && (
                        <pre style={{margin:'6px 0 0',background:'rgba(0,0,0,0.3)',padding:'6px 10px',borderRadius:'4px',fontSize:'10px',fontFamily:'JetBrains Mono,monospace',color:'#34D399',whiteSpace:'pre-wrap'}}>
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
