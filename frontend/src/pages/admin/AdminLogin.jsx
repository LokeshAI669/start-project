import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import JobZenLogo from '../../components/JobZenLogo';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied — this portal is for admins only.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <JobZenLogo theme={theme} size="md" />
          </div>
          <p style={{ color: 'var(--text-faint)', margin: '8px 0 0', fontSize: '14px' }}>Admin Portal Login</p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="form-error show" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

