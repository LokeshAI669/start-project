import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();
  const theme      = document.documentElement.getAttribute('data-theme') || 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('POST', '/api/login', { email, password });
      if (data.user.role !== 'admin') return setError('Access denied. Admin accounts only.'), setLoading(false);
      login(data.token, data.user);
      navigate('/admin');
    } catch (ex) {
      setError(ex.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid"></div>
      <div className="auth-card">
        <div className="auth-logo"><JobZenLogo theme={theme} size="sm" /></div>
        <h2>Admin Sign In</h2>
        <div className="auth-subtitle">Restricted access — admins only</div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email</label>
            <input className="form-input" id="admin-email" type="email" placeholder="admin@jobzen.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <div className="password-wrapper">
              <input className="form-input" id="admin-password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPw(!showPw)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  {showPw ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></>}
                </svg>
              </button>
            </div>
          </div>
          {error && <div className="form-error show">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{padding:'14px',fontSize:'15px',marginTop:'4px'}}>
            {loading ? 'Signing in...' : 'Admin Sign In →'}
          </button>
        </form>
        <span className="auth-link" style={{marginTop:'20px'}}><Link to="/login" style={{color:'var(--text-faint)'}}>← Student login</Link></span>
      </div>
    </div>
  );
}
