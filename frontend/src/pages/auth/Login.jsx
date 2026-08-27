import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import JobZenLogo from '../../components/JobZenLogo';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div className="card" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <JobZenLogo theme={theme} size="md" />
          </div>
          <p style={{ color: 'var(--text-faint)', margin: '8px 0 0', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password" />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/reset-password" style={{ fontSize: '13px', color: 'var(--orange)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          {error && <div className="form-error show" style={{ marginBottom: '16px' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-faint)' }}>
          Want to submit a project?{' '}
          <Link to="/request" style={{ color: 'var(--orange)', textDecoration: 'none' }}>Submit a request →</Link>
        </p>
      </div>
    </div>
  );
}
