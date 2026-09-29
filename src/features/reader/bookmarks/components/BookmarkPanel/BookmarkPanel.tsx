import type { Bookmark } from '../../types';
import { BookmarkItem } from '../BookmarkItem';
import './BookmarkPanel.css';

interface BookmarkPanelProps {
  /** Bookmarks for the book, ordered by page ascending. */
  bookmarks: Bookmark[];
  /** The page currently being read, used to highlight its bookmark. */
  currentPage: number;
  /** Called with a bookmark's page when the reader selects it. */
  onSelect: (page: number) => void;
  onRemove: (bookmarkId: string) => void;
  /** Called with a bookmark's new label; an empty label clears it. */
  onRename: (bookmarkId: string, label: string) => void;
  onClose: () => void;
}

/**
 * Lists all bookmarks for the current book.
 *
 * Presentational only — bookmark state and persistence live in
 * `useReaderBookmarks`; navigation is handled by the caller.
 */
export function BookmarkPanel({ bookmarks, currentPage, onSelect, onRemove, onRename, onClose }: BookmarkPanelProps) {
  return (
    <section
      className="bookmark-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmark-panel-title"
    >
      <div className="bookmark-panel__handle" aria-hidden="true" />

      <header className="bookmark-panel__header">
        <h2 id="bookmark-panel-title" className="bookmark-panel__title">
          Bookmarks
          {bookmarks.length > 0 && (
            <span className="bookmark-panel__count">{bookmarks.length}</span>
          )}
        </h2>
        <button
          type="button"
          className="bookmark-panel__close"
          onClick={onClose}
          aria-label="Close bookmarks"
          title="Close"
          autoFocus
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.25"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      {bookmarks.length === 0 ? (
        <p className="bookmark-panel__empty">
          No bookmarks yet. Use the bookmark button in the top bar to save the page you're on.
        </p>
      ) : (
        <ul className="bookmark-panel__list">
          {bookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              isCurrent={bookmark.page === currentPage}
              onSelect={onSelect}
              onRemove={onRemove}
              onRename={onRename}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
