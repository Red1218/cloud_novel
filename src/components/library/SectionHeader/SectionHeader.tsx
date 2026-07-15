import type { ReactNode } from 'react';
import './SectionHeader.css';

export interface SectionHeaderProps {
  /** The main title of the section */
  title: string;
  /** An optional subtitle or description */
  subtitle?: string;
  /** Optional actions (e.g., buttons, links) to display on the right */
  actions?: ReactNode;
  /** Optional ID for the heading element (for aria-labelledby) */
  id?: string;
}

/**
 * Reusable header for grouping sections within the library or other pages.
 */
export function SectionHeader({ title, subtitle, actions, id }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header__text">
        <h2 id={id} className="section-header__title">{title}</h2>
        {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="section-header__actions">{actions}</div>}
    </div>
  );
}
