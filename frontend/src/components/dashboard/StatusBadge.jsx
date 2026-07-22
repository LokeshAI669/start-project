import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

/**
 * StatusBadge Component
 * Displays a color-coded, rounded pill badge for project request statuses.
 * - Accepted: Emerald Green
 * - Pending: Amber / Gold
 * - Denied: Crimson Red
 */
export default function StatusBadge({ status }) {
  const normalizedStatus = (status || 'Pending').trim();

  if (normalizedStatus === 'Accepted') {
    return (
      <span className="status-badge status-accepted">
        <CheckCircle2 className="status-icon" size={14} />
        <span>Accepted</span>
      </span>
    );
  }

  if (normalizedStatus === 'Denied') {
    return (
      <span className="status-badge status-denied">
        <XCircle className="status-icon" size={14} />
        <span>Denied</span>
      </span>
    );
  }

  // Default: Pending
  return (
    <span className="status-badge status-pending">
      <Clock className="status-icon" size={14} />
      <span>Pending</span>
    </span>
  );
}
