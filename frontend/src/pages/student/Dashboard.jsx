import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import StudentLayout from '../../components/StudentLayout';
import StatCard from '../../components/dashboard/StatCard';
import RequestTable from '../../components/dashboard/RequestTable';
import RequestCard from '../../components/dashboard/RequestCard';
import { FileText, Clock, CheckCircle2, XCircle, Plus, Inbox, RefreshCw } from 'lucide-react';

// ── Skeleton shimmer row ────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 18px', borderBottom:'1px solid var(--border)',
      gap:'12px', animation:'skeletonPulse 1.4s ease-in-out infinite'
    }}>
      <div style={{flex:2, height:'13px', borderRadius:'6px', background:'var(--bg-elevated)'}} />
      <div style={{flex:1, height:'13px', borderRadius:'6px', background:'var(--bg-elevated)'}} />
      <div style={{width:'70px', height:'22px', borderRadius:'6px', background:'var(--bg-elevated)'}} />
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:'12px', padding:'20px', minHeight:'90px',
      animation:'skeletonPulse 1.4s ease-in-out infinite'
    }}>
      <div style={{width:'60%', height:'12px', borderRadius:'6px', background:'var(--bg-elevated)', marginBottom:'12px'}} />
      <div style={{width:'40%', height:'28px', borderRadius:'6px', background:'var(--bg-elevated)'}} />
    </div>
  );
}

export default function Dashboard() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await api('GET', '/api/requests/mine');
      setRequests(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'Pending').length;
  const accepted = requests.filter(r => r.status === 'Accepted').length;
  const denied = requests.filter(r => r.status === 'Denied').length;

  return (
    <StudentLayout title="My Requests" subtitle="Track and manage all your project submissions">
      {/* ── Summary Stats Grid ── */}
      <div className="stat-cards-grid">
        {loading ? (
          // Skeleton stat cards — show instantly so page feels loaded
          [1,2,3,4].map(i => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Requests" value={total}    icon={FileText}     variant="total"    />
            <StatCard label="Pending"        value={pending}  icon={Clock}        variant="pending"  />
            <StatCard label="Accepted"       value={accepted} icon={CheckCircle2} variant="accepted" />
            <StatCard label="Denied"         value={denied}   icon={XCircle}      variant="denied"   />
          </>
        )}
      </div>

      {/* ── Content Section ── */}
      <div className="dashboard-content-card">
        <div className="dashboard-section-header">
          <div>
            <h2 className="section-title">Project Submissions</h2>
            <p className="section-subtitle">
              {loading ? 'Loading...' : `Showing ${requests.length} total request${requests.length === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="header-actions">
            <button
              onClick={() => fetchRequests(true)}
              className={`btn-refresh-dashboard ${refreshing ? 'spinning' : ''}`}
              disabled={refreshing || loading}
              title="Refresh requests"
              aria-label="Refresh requests"
            >
              <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <Link to="/request" className="btn-create-request">
              <Plus size={16} />
              <span>New Request</span>
            </Link>
          </div>
        </div>

        {/* Skeleton table rows — visible immediately while data loads */}
        {loading && (
          <div>
            {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <Inbox size={32} />
            </div>
            <h3>No requests submitted yet</h3>
            <p>Ready to start? Submit your project details and get custom quotes and assistance.</p>
            <Link to="/request" className="btn-primary-gradient">
              <Plus size={18} />
              <span>Submit a Request</span>
            </Link>
          </div>
        )}

        {/* Requests List */}
        {!loading && !error && requests.length > 0 && (
          <>
            {/* Desktop & Tablet Table View (Hidden on mobile <768px) */}
            <div className="desktop-tablet-view">
              <RequestTable requests={requests} />
            </div>

            {/* Mobile Stacked Card View (Visible only on mobile <768px) */}
            <div className="mobile-stacked-view">
              {requests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}
