import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ArrowLeft, User } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={handleBack}
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--orange), #f97316)', 
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '32px', fontWeight: 'bold', margin: '0 auto 16px' 
          }}>
            {user?.name?.[0]?.toUpperCase() || <User size={40} />}
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>{user?.name || 'User Profile'}</h2>
          <p style={{ color: 'var(--text-faint)', fontSize: '14px', fontFamily: "'JetBrains Mono', monospace" }}>{user?.email}</p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-md)', marginBottom: '32px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-faint)' }}>Account Type</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>{user?.role || 'Student'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-faint)' }}>Status</span>
            <span style={{ color: 'var(--green)', fontWeight: '500' }}>Active</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--red)', borderColor: 'var(--red)' }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
