import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import JobZenLogo from '../../components/JobZenLogo';

export default function Login() {
  const [mode, setMode]         = useState('signin'); // 'signin' | 'signup'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, register }     = useContext(AuthContext);
  const navigate  = useNavigate();
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      let user;
      if (mode === 'signup') {
        user = await register(name.trim(), email.trim(), password);
      } else {
        user = await login(email.trim(), password);
      }
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message || (mode === 'signup' ? 'Registration failed.' : 'Login failed. Check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div className="card" style={{ padding: '36px 32px', maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <JobZenLogo theme={theme} size="md" />
          </div>
          <p style={{ color: 'var(--text-faint)', margin: '8px 0 0', fontSize: '14px' }}>
            {mode === 'signup' ? 'Create a student account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Tab switch between Sign In and Create Account */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255,255,255,0.05)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s',
              background: mode === 'signin' ? 'var(--orange, #3B82F6)' : 'transparent',
              color: mode === 'signin' ? '#fff' : 'var(--text-faint)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s',
              background: mode === 'signup' ? 'var(--orange, #3B82F6)' : 'transparent',
              color: mode === 'signup' ? '#fff' : 'var(--text-faint)'
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Full Name</label>
              <input 
                className="form-input" 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="John Doe" 
                required 
                autoComplete="name" 
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="you@gmail.com" 
              required 
              autoComplete="email" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: mode === 'signin' ? '8px' : '20px' }}>
            <label className="form-label">Password</label>
            <input 
              className="form-input" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              required 
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} 
            />
          </div>

          {mode === 'signin' && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link to="/reset-password" style={{ fontSize: '13px', color: 'var(--orange)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          )}

          {error && <div className="form-error show" style={{ marginBottom: '16px' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-faint)' }}>
          Want to submit a project directly?{' '}
          <Link to="/request" style={{ color: 'var(--orange)', textDecoration: 'none' }}>Submit a request →</Link>
        </p>
      </div>
    </div>
  );
}
