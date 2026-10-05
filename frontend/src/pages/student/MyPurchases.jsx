import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api, API_BASE } from '../../utils/api';
import StudentLayout from '../../components/StudentLayout';
import { 
  FileArchive, Download, CheckCircle2, AlertCircle, 
  ExternalLink, Clock, ShieldCheck, ArrowRight, Sparkles 
} from 'lucide-react';

export default function MyPurchases() {
  const { user } = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api('GET', '/api/purchases/my-purchases');
      setPurchases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load purchases:', err);
      setErrorMsg(err.message || 'Failed to load your purchases.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (projectId, projectTitle, purchaseId) => {
    setDownloadingId(projectId);
    setErrorMsg('');
    try {
      // Check quota and get 5-minute signed URL or direct download
      const res = await api('GET', `/api/download/${projectId}`);
      
      if (res.downloadUrl) {
        // Direct temporary signed URL
        const link = document.createElement('a');
        link.href = res.downloadUrl;
        link.setAttribute('download', `${projectTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback streaming download
        window.location.href = `${API_BASE}/api/download/${projectId}`;
      }

      // Update remaining download count locally
      setPurchases(prev => prev.map(p => {
        if (p.project_id === projectId) {
          return { ...p, download_count: (p.download_count || 0) + 1 };
        }
        return p;
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate secure download.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <StudentLayout title="My Purchases" subtitle="Access your purchased source code and project deliverables">
      <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {errorMsg && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#EF4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-faint)' }}>
            Loading your deliverables...
          </div>
        ) : purchases.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <FileArchive size={42} style={{ color: 'var(--text-faint)', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>No Purchases Found</h3>
            <p style={{ color: 'var(--text-faint)', fontSize: '13px', maxWidth: '420px', margin: '0 auto 20px' }}>
              You haven't purchased any premium project packages yet. Explore our verified project catalog to unlock complete source code, models, and docs.
            </p>
            <Link to="/browse" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Explore Projects <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {purchases.map((p) => {
              const isQuotaExhausted = (p.download_count || 0) >= (p.max_downloads || 5);
              const remaining = Math.max(0, (p.max_downloads || 5) - (p.download_count || 0));

              return (
                <div key={p.id} className="card" style={{
                  padding: '24px',
                  position: 'relative',
                  border: p.is_updated ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '11px',
                          color: 'var(--orange)',
                          background: 'var(--orange-soft)',
                          padding: '2px 8px',
                          borderRadius: '100px'
                        }}>
                          {p.project_domain || 'Technology'}
                        </span>
                        
                        {p.is_updated && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#F59E0B',
                            background: 'rgba(245,158,11,0.15)',
                            border: '1px solid rgba(245,158,11,0.35)',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Sparkles size={11} fill="#F59E0B" /> Updated — New Version Available (v{p.current_zip_version})
                          </span>
                        )}

                        <span style={{ fontSize: '11px', color: '#34D399', background: 'rgba(52,211,153,0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Verified Purchase
                        </span>
                      </div>

                      <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                        <Link to={`/catalog/${p.project_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {p.project_title}
                        </Link>
                      </h2>

                      <div style={{ fontSize: '12px', color: 'var(--text-faint)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <span>Paid: <strong>₹{Number(p.amount).toLocaleString('en-IN')}</strong></span>
                        <span>Payment ID: <code style={{ fontSize: '11px' }}>{p.razorpay_payment_id || 'N/A'}</code></span>
                        <span>Purchased: {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Action Download Button */}
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleDownload(p.project_id, p.project_title, p.id)}
                        disabled={downloadingId === p.project_id || isQuotaExhausted}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: isQuotaExhausted ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          color: isQuotaExhausted ? 'var(--text-faint)' : '#fff',
                          cursor: isQuotaExhausted ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Download size={16} />
                        <span>{downloadingId === p.project_id ? 'Generating Secure Link...' : isQuotaExhausted ? 'Download Limit Reached' : 'Download ZIP Archive'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quota & Security Info Footer */}
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    fontSize: '12px',
                    color: 'var(--text-faint)'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={14} style={{ color: '#34D399' }} /> 5-minute signed secure link generated on demand
                    </span>
                    <span>
                      Downloads remaining: <strong style={{ color: remaining > 0 ? '#34D399' : 'var(--red)' }}>{remaining} of {p.max_downloads || 5}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
