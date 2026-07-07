import type { Book } from '@/types';
import { BookCover } from '../BookCover';
import './BookCard.css';

export interface BookCardProps {
  /** The book data to display */
  book: Book;
  /** Callback fired when the 'Open' button is clicked */
  onOpen?: (book: Book) => void;
}

/**
 * Renders a single book in the library grid.
 * Pure UI component - all data and actions are passed in via props.
 */
export function BookCard({ book, onOpen }: BookCardProps) {
  const handleOpen = () => {
    if (onOpen) {
      onOpen(book);
    } else {
      console.log(book.id);
    }
  };

  return (
    <article className="book-card">
      <div className="book-card__cover-wrapper" onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleOpen()}>
        <BookCover src={book.cover} title={book.title} />
        <div className="book-card__overlay">
          <button type="button" className="book-card__open-btn" tabIndex={-1}>
            Open
          </button>
        </div>
      </div>

      <div className="book-card__info">
        <h3 className="book-card__title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-card__author" title={book.author}>
          {book.author}
        </p>

        <div className="book-card__meta">
          <div className="book-card__progress-wrapper">
            <div className="book-card__progress-bar">
              <div 
                className="book-card__progress-fill" 
                style={{ width: `${book.progress}%` }} 
                aria-valuenow={book.progress} 
                aria-valuemin={0} 
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <span className="book-card__progress-text">{book.progress}%</span>
          </div>
          <span className="book-card__last-opened">{book.lastOpened}</span>
        </div>
      </div>
    </article>
  );
}
