import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function StatsBadge({ count, label }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
      }}
      className="hero-delivery-badge"
    >
      <span className="hero-delivery-icon">
        <Users size={16} />
      </span>
      We have successfully delivered projects to over{' '}
      <span className="highlight-text">{count} {label}</span>.
    </motion.div>
  );
}
