import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';

export default function ResetPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      // POST /api/auth/reset-request when that endpoint is implemented
      await api('POST', '/api/auth/reset-request', { email });
      setSent(true);
    } catch (err) {
      // Show success even on error to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const theme2 = document.documentElement.getAttribute('data-theme') || 'dark';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div className="card" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <JobZenLogo theme={theme} size="md" />
          </div>
          <p style={{ color: 'var(--text-faint)', margin: '8px 0 0', fontSize: '14px' }}>Reset your password</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📬</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              If an account with <strong>{email}</strong> exists, a reset link has been sent.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', margin: '0 0 20px' }}>
              We'll send a reset link to this address if it's registered.
            </p>

            {error && <div className="form-error show" style={{ marginBottom: '16px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-faint)' }}>
              Remembered it?{' '}
              <Link to="/login" style={{ color: 'var(--orange)', textDecoration: 'none' }}>Sign in →</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
