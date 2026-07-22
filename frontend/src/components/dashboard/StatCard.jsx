import React from 'react';

/**
 * StatCard Component
 * Renders a clean, minimal summary stat card with count, label, icon, and accent color.
 */
export default function StatCard({ label, value, icon: Icon, variant = 'default' }) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <div className="stat-card-icon-wrapper">
            <Icon size={18} className="stat-card-icon" />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value ?? 0}</div>
    </div>
  );
}
