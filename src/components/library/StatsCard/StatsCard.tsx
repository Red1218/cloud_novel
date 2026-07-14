import type { ReactNode } from 'react';
import './StatsCard.css';

export interface StatsCardProps {
  /** Label for the statistic (e.g., "Books") */
  label: string;
  /** The statistic value (e.g., 12 or "14h 20m") */
  value: string | number;
  /** Optional icon to display alongside the value */
  icon?: ReactNode;
}

/**
 * Reusable card to display a single library statistic.
 */
export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="stats-card__content">
        <span className="stats-card__label">{label}</span>
        <span className="stats-card__value">{value}</span>
      </div>
      {icon && (
        <div className="stats-card__icon" aria-hidden="true">
          {icon}
        </div>
      )}
    </div>
  );
}
