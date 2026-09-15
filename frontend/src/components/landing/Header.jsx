import React from 'react';
import { Link } from 'react-router-dom';
import JobZenLogo from '../JobZenLogo';

export default function Header({ navigate }) {
  return (
    <header className="pub-navbar" id="navbar">
      <Link to="/" className="pub-navbar-logo">
        <JobZenLogo theme="dark" size="md" />
      </Link>
      <div className="pub-navbar-links">
        <button
          onClick={() => navigate('/request')}
          className="btn btn-primary btn-sm"
        >
          Submit Request
        </button>
      </div>
    </header>
  );
}
