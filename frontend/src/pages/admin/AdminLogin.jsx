import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import JobZenLogo from '../../components/JobZenLogo';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@mock.com');
  const [password, setPassword] = useState('admin123');
  const { setRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate API login
    setRole('admin');
    navigate('/admin/dashboard');
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div className="card" style={{padding:'40px',maxWidth:'400px',width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'8px'}}>
            <JobZenLogo theme={theme} size="md" />
          </div>
          <p style={{color:'var(--text-faint)',margin:'8px 0 0',fontSize:'14px'}}>Admin Portal Login</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{marginBottom:'24px'}}>
            <label className="form-label">Password</label>
            <input 
              className="form-input" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%'}}>
            Sign in as Admin
          </button>
        </form>
      </div>
    </div>
  );
}
