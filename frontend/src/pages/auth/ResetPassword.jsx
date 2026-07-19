import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenParam     = searchParams.get('token');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [isError, setIsError]   = useState(false);
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setIsError(false);
    try {
      const data = await api('POST', '/api/forgot-password', { email });
      setMsg(data.message);
    } catch (ex) {
      setMsg(ex.message); setIsError(true);
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setMsg('Passwords do not match.'); setIsError(true); return; }
    if (password.length < 6) { setMsg('Password must be at least 6 characters.'); setIsError(true); return; }
    setLoading(true); setMsg(''); setIsError(false);
    try {
      const data = await api('POST', '/api/reset-password', { token: tokenParam, password });
      setMsg(data.message);
    } catch (ex) {
      setMsg(ex.message); setIsError(true);
    } finally { setLoading(false); }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" className="password-toggle-btn" onClick={toggle}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        {show ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></>}
      </svg>
    </button>
  );

  return (
    <div className="auth-page">
      <div className="auth-grid"></div>
      <div className="auth-card">
        <div className="auth-logo"><JobZenLogo theme={theme} size="sm" /></div>
        <h2>{tokenParam ? 'Set New Password' : 'Forgot Password'}</h2>
        <div className="auth-subtitle">
          {tokenParam ? 'Enter your new password below' : 'Enter your email to receive a reset link'}
        </div>

        {!tokenParam ? (
          <form className="auth-form" onSubmit={handleForgot} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-email">Email Address</label>
              <input className="form-input" id="fp-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {msg && <div className={isError ? 'form-error show' : ''} style={!isError ? {padding:'12px',background:'var(--green-soft)',border:'1px solid var(--green-border)',borderRadius:'8px',color:'var(--green)',fontSize:'13px'} : {}}>{msg}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{padding:'14px',fontSize:'15px',marginTop:'4px'}}>
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleReset} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="rp-password">New Password</label>
              <div className="password-wrapper">
                <input className="form-input" id="rp-password" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                {eyeBtn(showPw, () => setShowPw(!showPw))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rp-confirm">Confirm Password</label>
              <div className="password-wrapper">
                <input className="form-input" id="rp-confirm" type={showPw ? 'text' : 'password'} placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
            </div>
            {msg && <div className={isError ? 'form-error show' : ''} style={!isError ? {padding:'12px',background:'var(--green-soft)',border:'1px solid var(--green-border)',borderRadius:'8px',color:'var(--green)',fontSize:'13px'} : {}}>{msg}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{padding:'14px',fontSize:'15px',marginTop:'4px'}}>
              {loading ? 'Resetting...' : 'Set New Password →'}
            </button>
          </form>
        )}
        <span className="auth-link" style={{marginTop:'20px'}}><Link to="/login" style={{color:'var(--text-faint)'}}>← Back to Sign In</Link></span>
      </div>
    </div>
  );
}
