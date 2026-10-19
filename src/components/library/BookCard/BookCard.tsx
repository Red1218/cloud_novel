import type { Book } from '@/types/book';
import { formatRelativeTime } from '@/features/library/utils/formatRelativeTime';
import { BookCover } from '@/components/library/BookCover/BookCover';
import './BookCard.css';

export interface BookCardProps {
  /** The book data to display */
  book: Book;
  /** Callback fired when the 'Open' button is clicked */
  onOpen?: (bookId: string) => void;
}

/**
 * Renders a single book in the library grid.
 * Pure UI component - all data and actions are passed in via props.
 *
 * Accessibility:
 * - Valid HTML structure (no nested buttons)
 * - Keyboard accessible
 * - Hover animation respects @media (hover: hover)
 * - Respects prefers-reduced-motion
 * - SVGs have aria-hidden="true" unless informative
 */
export function BookCard({ book, onOpen }: BookCardProps) {
  const handleOpen = () => onOpen?.(book.id);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const lastOpenedText = formatRelativeTime(book.lastOpened);

  return (
    <article className="book-card">
      {/*
        Cover wrapper is a clickable div with role="button".
        This avoids nested buttons while maintaining keyboard accessibility.
      */}
      <div
        className="book-card__cover-wrapper"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open ${book.title}`}
      >
        <BookCover src={book.thumbnail} title={book.title} />
        <div className="book-card__overlay" aria-hidden="true">
          <span className="book-card__open-btn">Open</span>
        </div>
      </div>

      <div className="book-card__info">
        <h3 className="book-card__title" title={book.title}>
          {book.title}
        </h3>
        {book.author && (
          <p className="book-card__author" title={book.author}>
            {book.author}
          </p>
        )}

        <div className="book-card__meta">
          <div className="book-card__progress-wrapper">
            <div
              className="book-card__progress-bar"
              aria-valuenow={book.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label={`Reading progress: ${Math.round(book.progress)}%`}
            >
              <div
                className="book-card__progress-fill"
                style={{ width: `${book.progress}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="book-card__progress-text" aria-hidden="true">
              {Math.round(book.progress)}%
            </span>
          </div>
          {lastOpenedText && (
            <span className="book-card__last-opened">
              {lastOpenedText}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
