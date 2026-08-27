import React from 'react';
import { Link } from 'react-router-dom';
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
