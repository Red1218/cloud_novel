import type { ReactNode } from 'react';
import './PageWrapper.css';

interface PageWrapperProps {
  /** Page heading rendered as an <h1>. */
  title: string;
  /** Optional subtitle below the heading. */
  description?: string;
  /** Optional CTA or action element placed top-right of the header. */
  action?: ReactNode;
  /** Page body content. */
  children?: ReactNode;
}

/**
 * Consistent page container used by every page.
 * Provides standardised spacing, heading hierarchy,
 * and maximum content width.
 */
export function PageWrapper({
  title,
  description,
  action,
  children,
}: PageWrapperProps) {
  return (
    <div className="page-wrapper">
      <header className="page-wrapper__header">
        <div className="page-wrapper__heading-group">
          <h1 className="page-wrapper__title">{title}</h1>
          {description && (
            <p className="page-wrapper__description">{description}</p>
          )}
        </div>
        {action && (
          <div className="page-wrapper__action">{action}</div>
        )}
      </header>

      {children && (
        <div className="page-wrapper__body">{children}</div>
      )}
    </div>
  );
}
