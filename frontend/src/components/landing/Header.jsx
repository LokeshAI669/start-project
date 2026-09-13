import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import JobZenLogo from '../JobZenLogo';

export default function Header({ theme, toggleTheme, navigate }) {
  return (
    <header className="pub-navbar" id="navbar">
      <Link to="/" className="pub-navbar-logo">
        <JobZenLogo theme={theme} size="md" />
      </Link>
      <div className="pub-navbar-links">
        {/* Theme toggle — now actually works */}
        {toggleTheme && (
          <motion.button
            onClick={toggleTheme}
            className="btn-icon-ghost"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {theme === 'dark'
              ? <Sun size={16} />
              : <Moon size={16} />
            }
          </motion.button>
        )}
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
