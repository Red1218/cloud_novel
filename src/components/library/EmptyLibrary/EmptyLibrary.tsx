import type { ReactNode } from 'react';
import './EmptyLibrary.css';

export interface EmptyLibraryProps {
  /** The title of the empty state */
  title: string;
  /** The description of the empty state */
  description: string;
  /** The text for the action button */
  buttonText: string;
  /** Callback fired when the action button is clicked */
  onAction: () => void;
  /** Optional icon or illustration node (falls back to a default if omitted) */
  illustration?: ReactNode;
  /** Optional secondary action */
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

/**
 * Reusable empty state component, primarily used when no books exist.
 *
 * Accessibility:
 * - Uses semantic HTML (article for the container)
 * - Button has clear focus states
 * - Respects prefers-reduced-motion
 */
export function EmptyLibrary({
  title,
  description,
  buttonText,
  onAction,
  illustration,
  secondaryAction,
}: EmptyLibraryProps) {
  return (
    <article className="empty-library" aria-labelledby="empty-library-title">
      <div className="empty-library__illustration">
        {illustration || (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="12" y2="11" />
          </svg>
        )}
      </div>
      <h2 id="empty-library-title" className="empty-library__title">
        {title}
      </h2>
      <p className="empty-library__description">
        {description}
      </p>
      <div className="empty-library__actions">
        <button
          type="button"
          className="empty-library__action"
          onClick={onAction}
        >
          {buttonText}
        </button>
        {secondaryAction && (
          <button
            type="button"
            className="empty-library__action empty-library__action--secondary"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.text}
          </button>
        )}
      </div>
    </article>
  );
}
