import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Grid2X2,
  Home,
  Inbox,
  LayoutDashboard,
  Plus,
  PlusCircle,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';
import './Dashboard.css';

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */
function statusBadgeClass(status) {
  if (!status) return 'db-badge db-badge-default';
  const s = status.toLowerCase();
  if (s === 'pending')  return 'db-badge db-badge-pending';
  if (s === 'accepted') return 'db-badge db-badge-accepted';
  if (s === 'denied')   return 'db-badge db-badge-denied';
  return 'db-badge db-badge-default';
}

function formatBudget(amount, currency = '₹') {
  if (!amount && amount !== 0) return '—';
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Skeletons ── */
function StatSkeleton() {
  return (
    <div className="db-skel">
      <div className="db-skel-line" style={{ width: '55%' }} />
      <div className="db-skel-val" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="db-skel-row">
      <div style={{ flex: 2 }} />
      <div style={{ flex: 1 }} />
      <div style={{ width: 72 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState('');
  
  // Read anonymous user fallback from local storage
  const anonUser = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('anon_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Wait for auth to resolve before fetching — avoids spurious 401 on page load
  useEffect(() => {
    if (!authLoading) fetchRequests();
  }, [authLoading]);

  const fetchRequests = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      // Build headers: JWT is injected automatically by api.js;
      // for public (no-account) users pass email in header
      const headers = {};
      if (!user && !anonUser && !authLoading) {
        // No session — show empty state rather than crashing
        setRequests([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const data = await api('GET', '/api/requests/mine', null, headers);
      setRequests(data || []);
    } catch (e) {
      // 401 = not logged in, show empty rather than red error
      if (e.message?.toLowerCase().includes('unauthorized')) {
        setRequests([]);
      } else {
        setError(e.message || 'Failed to load requests');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const total    = requests.length;
  const pending  = requests.filter(r => r.status === 'Pending').length;
  const accepted = requests.filter(r => r.status === 'Accepted').length;
  const denied   = requests.filter(r => r.status === 'Denied').length;

  const STATS = [
    { label: 'Total Requests', value: total,    icon: FileText,     color: '#748cff' },
    { label: 'Pending',        value: pending,  icon: Clock,        color: '#FFB86B' },
    { label: 'Accepted',       value: accepted, icon: CheckCircle2, color: '#d8ff5c' },
    { label: 'Denied',         value: denied,   icon: XCircle,      color: '#ff6b8a' },
  ];

  return (
    <div className="db-wrap">
      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <Link to="/" className="db-logo">
          <JobZenLogo theme="dark" size="sm" />
        </Link>

        <div className="db-sidebar-profile">
          <div className="db-profile-letter">
            {user?.name 
              ? user.name[0].toUpperCase() 
              : (anonUser?.name ? anonUser.name[0].toUpperCase() : 'U')}
          </div>
          <div>
            <strong>{user?.name || anonUser?.name || 'Welcome back'}</strong>
            <small>{user?.email || anonUser?.email || 'Keep building'}</small>
          </div>
        </div>

        <nav className="db-nav">
          <Link to="/dashboard" className="db-active">
            <LayoutDashboard size={20} /> My Requests
          </Link>
          <Link to="/request">
            <PlusCircle size={20} /> New Request
          </Link>
          <Link to="/browse">
            <Grid2X2 size={20} /> Projects
          </Link>
        </nav>

      </aside>

      {/* ── Main ── */}
      <main className="db-main">
        {/* Header */}
        <header className="db-header">
          <div>
            <p className="db-kicker">Track your progress</p>
            <h1>My Requests</h1>
            <p className="db-subtitle">Track and manage all your project submissions.</p>
          </div>
          <Link to="/" className="db-home-btn">
            <Home size={17} /> Home
          </Link>
        </header>

        {/* Stat cards */}
        <div className="db-stats">
          {loading
            ? [1,2,3,4].map(i => <StatSkeleton key={i} />)
            : STATS.map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  className="db-stat"
                  style={{ '--stat-color': color }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="db-stat-top">
                    <span className="db-stat-label">{label}</span>
                    <div className="db-stat-icon"><Icon size={18} /></div>
                  </div>
                  <div className="db-stat-value">{value}</div>
                </motion.div>
              ))
          }
        </div>

        {/* Submissions card */}
        <div className="db-content-card">
          <div className="db-content-header">
            <div>
              <p className="db-content-title">Project Submissions</p>
              <p className="db-content-sub">
                {loading
                  ? 'Loading…'
                  : `Showing ${requests.length} total request${requests.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <div className="db-header-actions">
              <button
                className={`db-btn-refresh ${refreshing ? 'spinning' : ''}`}
                onClick={() => fetchRequests(true)}
                disabled={refreshing || loading}
              >
                <RefreshCw size={15} />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
              <Link to="/request" className="db-btn-new">
                <Plus size={16} /> New Request
              </Link>
            </div>
          </div>

          {/* Skeleton rows */}
          {loading && [1,2,3,4,5].map(i => <RowSkeleton key={i} />)}

          {/* Error */}
          <AnimatePresence>
            {error && !loading && (
              <motion.div
                className="db-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <X size={16} style={{ flexShrink: 0 }} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && !error && requests.length === 0 && (
            <motion.div
              className="db-empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="db-empty-icon"><Inbox size={28} /></div>
              <h3>No requests submitted yet</h3>
              <p>Ready to start? Submit your project details and get custom quotes and assistance.</p>
              <Link to="/request" className="db-btn-submit">
                <Plus size={18} /> Submit a Request
              </Link>
            </motion.div>
          )}

          {/* Desktop table */}
          {!loading && !error && requests.length > 0 && (
            <>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Budget</th>
                    <th>Meeting</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {requests.map((req, i) => (
                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td>
                          <div className="db-project-name">{req.project_name || '—'}</div>
                          <div className="db-project-email">{req.email}</div>
                        </td>
                        <td className="db-budget-cell">
                          {formatBudget(req.budget, req.currency)}
                        </td>
                        <td>{req.preferred_date ? formatDate(req.preferred_date) : '—'}</td>
                        <td>{formatDate(req.created_at)}</td>
                        <td>
                          <span className={statusBadgeClass(req.status)}>
                            {req.status || 'Pending'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* Mobile card view */}
              <div className="db-mobile-cards">
                {requests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    className="db-req-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="db-req-card-top">
                      <div>
                        <div className="db-req-card-name">{req.project_name || '—'}</div>
                        <div className="db-req-card-email">{req.email}</div>
                      </div>
                      <span className={statusBadgeClass(req.status)}>
                        {req.status || 'Pending'}
                      </span>
                    </div>
                    <div className="db-req-card-meta">
                      <span>💰 {formatBudget(req.budget, req.currency)}</span>
                      <span>📅 {formatDate(req.preferred_date)}</span>
                      <span>🕐 {formatDate(req.created_at)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
