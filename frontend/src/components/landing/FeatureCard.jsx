import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function FeatureCard({ title, percentage, metrics, icon: Icon, badgeText }) {
  return (
    <motion.div 
      className="animated-dashboard-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="animated-dashboard-header">
        <div style={{ flex: 1 }}>
          <div className="animated-dashboard-eyebrow">{title}</div>
          <div className="animated-dashboard-percentage">{percentage}</div>
        </div>
        <motion.div 
          className="animated-dashboard-icon"
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <Icon />
        </motion.div>
      </div>

      <div className="animated-dashboard-bar">
        <motion.div 
          className="animated-dashboard-progress" 
          initial={{ width: 0 }}
          whileInView={{ width: percentage }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <div className="animated-dashboard-stats">
        {metrics.map((metric, idx) => (
          <div className="animated-dashboard-stat-row" key={idx}>
            <span>{metric.label}</span>
            <span style={{ color: 'var(--orange)', fontWeight: '600' }}>{metric.value}</span>
          </div>
        ))}
      </div>

      {badgeText && (
        <div className="animated-dashboard-badge">
          <Sparkles size={12} style={{ color: 'var(--orange)' }} />
          {badgeText}
        </div>
      )}
    </motion.div>
  );
}
