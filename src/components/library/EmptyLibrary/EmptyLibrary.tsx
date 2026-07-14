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
}

/**
 * Reusable empty state component, primarily used when no books exist.
 */
export function EmptyLibrary({
  title,
  description,
  buttonText,
  onAction,
  illustration,
}: EmptyLibraryProps) {
  return (
    <div className="empty-library">
      <div className="empty-library__illustration" aria-hidden="true">
        {illustration || '\u{1F4D6}' /* 📖 */}
      </div>
      <h2 className="empty-library__title">{title}</h2>
      <p className="empty-library__description">{description}</p>
      <button type="button" className="empty-library__action" onClick={onAction}>
        {buttonText}
      </button>
    </div>
  );
}
