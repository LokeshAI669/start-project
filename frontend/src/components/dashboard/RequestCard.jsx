import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Eye, Calendar, DollarSign, Clock } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = (c, b) => `${c || '₹'}${Number(b || 0).toLocaleString('en-IN')}`;

/**
 * RequestCard Component
 * Rendered on Mobile screens (<768px).
 * Displays a single project request as a stacked card with touch-friendly targets (min 44px height).
 */
export default function RequestCard({ request }) {
  const { id, project_name, currency, budget, preferred_date, preferred_time, status, created_at } = request;

  return (
    <div className="request-card-mobile">
      {/* Top row: Project name & Status badge */}
      <div className="request-card-mobile-header">
        <h3 className="request-card-mobile-title">{project_name}</h3>
        <StatusBadge status={status} />
      </div>

      {/* Detail grid */}
      <div className="request-card-mobile-body">
        <div className="request-card-mobile-field">
          <span className="field-label">Budget</span>
          <span className="field-value budget-highlight">{fmtCurrency(currency, budget)}</span>
        </div>

        <div className="request-card-mobile-field">
          <span className="field-label">Meeting Date</span>
          <span className="field-value icon-text font-normal">
            <Calendar size={14} className="text-muted" />
            {fmtDate(preferred_date)}{preferred_time ? ` · ${preferred_time}` : ''}
          </span>
        </div>

        <div className="request-card-mobile-field">
          <span className="field-label">Submitted</span>
          <span className="field-value text-muted text-sm icon-text">
            <Clock size={13} />
            {fmtDate(created_at)}
          </span>
        </div>
      </div>

      {/* Footer action button - min 44px tap height */}
      <div className="request-card-mobile-footer">
        <Link to={`/project?id=${id}`} className="btn-mobile-view">
          <span>View Details</span>
          <Eye size={18} />
        </Link>
      </div>
    </div>
  );
}
