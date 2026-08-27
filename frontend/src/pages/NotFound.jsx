import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        {/* Big 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 160 }}
          style={{
            fontSize: 'clamp(80px, 20vw, 140px)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
          }}
        >
          404
        </motion.div>

        <h1 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 10px',
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: '0.93rem',
          color: 'var(--text-secondary)',
          margin: '0 0 6px',
          lineHeight: 1.6,
        }}>
          The URL <code style={{
            background: 'var(--bg-elevated)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: 'var(--orange-light)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>{pathname}</code> doesn't exist.
        </p>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-faint)',
          margin: '0 0 32px',
        }}>
          It may have been moved, deleted, or you may have mistyped the address.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'var(--orange)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'background 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--orange-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--orange)'}
          >
            <Home size={16} /> Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'border-color 0.18s, color 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
