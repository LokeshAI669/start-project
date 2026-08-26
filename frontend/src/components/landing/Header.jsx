import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import JobZenLogo from '../JobZenLogo';

export default function Header({ theme, toggleTheme, navigate }) {
  return (
    <header className="pub-navbar" id="navbar">
      <Link to="/" className="pub-navbar-logo">
        <JobZenLogo theme={theme} size="md" />
      </Link>
      <div className="pub-navbar-links">
        <motion.button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={false}
          animate={{ rotate: theme === 'dark' ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '50%', 
            background: 'var(--bg-elevated)', 
            border: '1px solid var(--border)', 
            color: 'var(--text-primary)', 
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>
        <div className="nav-divider"></div>
        <motion.button 
          onClick={() => navigate('/request')} 
          className="btn btn-primary btn-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Submit Request
        </motion.button>
      </div>
    </header>
  );
}
