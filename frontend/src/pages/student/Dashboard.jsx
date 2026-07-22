import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import StudentLayout from '../../components/StudentLayout';
import StatCard from '../../components/dashboard/StatCard';
import RequestTable from '../../components/dashboard/RequestTable';
import RequestCard from '../../components/dashboard/RequestCard';
import { FileText, Clock, CheckCircle2, XCircle, Plus, Inbox } from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role === 'admin') { navigate('/admin'); return; }
    fetchRequests();
  }, [token, navigate, user?.role]);

  const fetchRequests = async () => {
    try {
      const data = await api('GET', '/api/requests/mine');
      setRequests(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
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
        <StatCard 
          label="Total Requests" 
          value={total} 
          icon={FileText} 
          variant="total"
        />
        <StatCard 
          label="Pending" 
          value={pending} 
          icon={Clock} 
          variant="pending"
        />
        <StatCard 
          label="Accepted" 
          value={accepted} 
          icon={CheckCircle2} 
          variant="accepted"
        />
        <StatCard 
          label="Denied" 
          value={denied} 
          icon={XCircle} 
          variant="denied"
        />
      </div>

      {/* ── Content Section ── */}
      <div className="dashboard-content-card">
        <div className="dashboard-section-header">
          <div>
            <h2 className="section-title">Project Submissions</h2>
            <p className="section-subtitle">Showing {requests.length} total request{requests.length === 1 ? '' : 's'}</p>
          </div>

          <Link to="/request" className="btn-create-request">
            <Plus size={16} />
            <span>New Request</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading your requests...</p>
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
