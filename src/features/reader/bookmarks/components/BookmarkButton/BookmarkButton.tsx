import './BookmarkButton.css';

interface BookmarkButtonProps {
  /** Whether the current page is bookmarked. */
  isBookmarked: boolean;
  /** Called when the reader toggles the bookmark for the current page. */
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * Toggles a bookmark for the current page.
 *
 * Presentational only — bookmark state comes from `useReaderBookmarks`.
 */
export function BookmarkButton({ isBookmarked, onToggle, disabled = false }: BookmarkButtonProps) {
  const label = isBookmarked ? 'Remove bookmark from this page' : 'Bookmark this page';

  return (
    <button
      type="button"
      className={`bookmark-button ${isBookmarked ? 'bookmark-button--active' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isBookmarked}
      aria-label={label}
      title={label}
    >
      <svg width="19" height="19" viewBox="0 0 24 24"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
