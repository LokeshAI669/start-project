import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('All fields required.');
    setLoading(true);
    try {
      const data = await api('POST', '/api/login', { email, password });
      login(data.token, data.user);
      // Redirect by role
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (ex) {
      setError(ex.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid"></div>
      <div className="auth-card">
        <div className="auth-logo"><JobZenLogo theme={document.documentElement.getAttribute('data-theme') || 'dark'} size="sm" /></div>
        <h2>Welcome Back</h2>
        <div className="auth-subtitle">Enter your credentials to continue</div>
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              className="form-input" 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input 
                className="form-input" 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            <div style={{textAlign: 'right', marginTop: '6px'}}>
              <Link to="/reset-password" style={{fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-faint)', transition: 'color .18s ease'}}>Forgot password?</Link>
            </div>
          </div>
          {error && <div className="form-error show">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{padding: '14px 20px', fontSize: '15px', borderRadius: '12px', marginTop: '4px'}}>
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-divider" style={{marginTop: '22px'}}><span>or</span></div>
        <span className="auth-link">New here? <Link to="/register">Create an account →</Link></span>
        <span className="auth-link" style={{marginTop: '8px'}}><Link to="/" style={{color: 'var(--text-faint)'}}>← Back to home</Link></span>
      </div>
    </div>
  );
}
