import React from 'react';
import { motion } from 'motion/react';

export default function StatusBar() {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
      }}
      className="hero-trust"
    >
      <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }}></span>
        SYSTEM ONLINE
      </span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
      <span style={{ color: 'var(--text-faint)', fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em' }}>REAL-TIME TRACKING</span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
      <span style={{ color: 'var(--text-faint)', fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em' }}>FREE FOREVER</span>
    </motion.div>
  );
}
