import type { Bookmark } from '../../types';
import './BookmarkItem.css';

interface BookmarkItemProps {
  bookmark: Bookmark;
  /** Whether this bookmark is on the page currently being read. */
  isCurrent: boolean;
  onSelect: (page: number) => void;
  onRemove: (bookmarkId: string) => void;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

/**
 * Renders a single bookmark entry within the BookmarkPanel.
 */
export function BookmarkItem({ bookmark, isCurrent, onSelect, onRemove }: BookmarkItemProps) {
  const pageLabel = `Page ${bookmark.page}`;

  return (
    <li className={`bookmark-item ${isCurrent ? 'bookmark-item--current' : ''}`}>
      <button
        type="button"
        className="bookmark-item__main"
        onClick={() => onSelect(bookmark.page)}
        aria-current={isCurrent ? 'page' : undefined}
      >
        <span className="bookmark-item__page">{pageLabel}</span>
        {bookmark.label && <span className="bookmark-item__label">{bookmark.label}</span>}
        <span className="bookmark-item__date">{dateFormat.format(bookmark.createdAt)}</span>
      </button>
      <button
        type="button"
        className="bookmark-item__remove"
        onClick={() => onRemove(bookmark.id)}
        aria-label={`Remove bookmark on ${pageLabel.toLowerCase()}`}
        title="Remove bookmark"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </li>
  );
}
