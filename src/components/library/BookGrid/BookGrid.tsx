import type { ReactNode } from 'react';
import type { Book } from '@/types';
import { BookCard } from '../BookCard';
import './BookGrid.css';

export interface BookGridProps {
  /** The books to display in the grid */
  books: readonly Book[];
  /** Optional callback fired when a book is opened */
  onOpenBook?: (bookId: string) => void;
  /** Content to display when the books array is empty */
  emptyState?: ReactNode;
}

/**
 * Renders a responsive grid of books.
 */
export function BookGrid({ books, onOpenBook, emptyState }: BookGridProps) {
  if (books.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onOpen={onOpenBook} />
      ))}
    </div>
  );
}
