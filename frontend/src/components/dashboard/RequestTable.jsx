import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Eye, Calendar } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = (c, b) => `${c || '₹'}${Number(b || 0).toLocaleString('en-IN')}`;

/**
 * RequestTable Component
 * Rendered on Tablet (768px+) and Desktop (>1024px) screens.
 * Clean, readable data table with hover states and subtle borders.
 */
export default function RequestTable({ requests }) {
  return (
    <div className="request-table-wrapper">
      <table className="request-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Budget</th>
            <th>Meeting Date</th>
            <th>Status</th>
            <th>Submitted</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="request-table-row">
              <td className="font-semibold text-primary">
                <div className="project-title-cell">
                  <span>{r.project_name}</span>
                </div>
              </td>
              <td className="whitespace-nowrap text-secondary">
                <span className="budget-tag">{fmtCurrency(r.currency, r.budget)}</span>
              </td>
              <td className="whitespace-nowrap text-secondary">
                <div className="meeting-date-cell">
                  <Calendar size={13} className="text-muted" />
                  <span>{fmtDate(r.preferred_date)}{r.preferred_time ? ` · ${r.preferred_time}` : ''}</span>
                </div>
              </td>
              <td className="whitespace-nowrap">
                <StatusBadge status={r.status} />
              </td>
              <td className="whitespace-nowrap text-muted text-sm">
                {fmtDate(r.created_at)}
              </td>
              <td className="whitespace-nowrap text-right">
                <Link to={`/project?id=${r.id}`} className="btn-action-view">
                  <Eye size={15} />
                  <span>View</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
