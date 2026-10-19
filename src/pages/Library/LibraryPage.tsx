import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { Icon } from '@/components/ui/Icon/Icon';
import { PageWrapper } from '@/components/ui/PageWrapper/PageWrapper';
import { ROUTES } from '@/constants/routes';
import { SectionHeader } from '@/components/library/SectionHeader/SectionHeader';
import { StatsCard } from '@/components/library/StatsCard/StatsCard';
import { SortDropdown } from '@/components/library/SortDropdown/SortDropdown';
import { BookGrid } from '@/components/library/BookGrid/BookGrid';
import { EmptyLibrary } from '@/components/library/EmptyLibrary/EmptyLibrary';
import { ImportButton } from '@/components/library/ImportButton/ImportButton';
import { deriveContinueReadingBooks } from '@/features/library/utils/deriveContinueReadingBooks';
import { sortBooks, type SortOption } from '@/features/library/utils/sortBooks';
import { deriveLibraryStats } from '@/features/library/utils/deriveLibraryStats';

import './LibraryPage.css';

/** Number of skeleton cards to show while loading. */
const SKELETON_COUNT = 6;

/**
 * Library page composing the domain components.
 * Integrates the useLibrary hook for IndexedDB persistence and PDF import.
 */
export function LibraryPage() {
  useDocumentTitle('Library');

  const navigate = useNavigate();
  const { books, isLoading, isImporting, importBook } = useLibrary();

  // Sorting state owned by LibraryPage
  const [sortBy, setSortBy] = useState<SortOption>('recentlyAdded');

  // Derive statistics (single O(n) pass)
  const stats = useMemo(() => deriveLibraryStats(books), [books]);

  // Derive continue reading books
  const continueReadingBooks = useMemo(
    () => deriveContinueReadingBooks(books),
    [books]
  );

  // Sort books for the main grid
  const sortedBooks = useMemo(
    () => sortBooks(books, sortBy),
    [books, sortBy]
  );

  const handleOpenBook = useCallback(
    (bookId: string) => {
      navigate(`${ROUTES.READER}/${bookId}`);
    },
    [navigate]
  );

  // Format stats for display
  const statItems = [
    { label: 'Total Books', value: stats.totalBooks, icon: <Icon name="books" size={20} /> },
    { label: 'Reading', value: stats.reading, icon: <Icon name="book" size={20} /> },
    { label: 'Finished', value: stats.finished, icon: <Icon name="finished" size={20} /> },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <PageWrapper title="Library" description="All your books in one place.">
        <section className="library-page__main">
          <SectionHeader title="All Books" subtitle="Loading library..." />
          <div className="book-grid book-grid--loading">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div key={`book-skeleton-${index}`} className="book-card book-card--skeleton">
                <div className="book-card__cover-wrapper">
                  <div className="book-cover book-cover--skeleton" />
                </div>
                <div className="book-card__info">
                  <div className="book-card__skeleton-text book-card__skeleton-text--title" />
                  <div className="book-card__skeleton-text book-card__skeleton-text--author" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Library" description="All your books in one place.">
      {/* 1. Statistics Row */}
      {books.length > 0 && (
        <section className="library-page__stats" aria-label="Library statistics">
          {statItems.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </section>
      )}

      {/* 2. Continue Reading Section */}
      {continueReadingBooks.length > 0 && (
        <section className="library-page__continue-reading" aria-labelledby="continue-reading-heading">
          <SectionHeader
            id="continue-reading-heading"
            title="Continue Reading"
            subtitle="Continue where you left off"
          />
          <BookGrid
            books={continueReadingBooks}
            onOpenBook={handleOpenBook}
          />
        </section>
      )}

      {/* 3. Main Library Area */}
      <section className="library-page__main" aria-labelledby="all-books-heading">
        <SectionHeader
          id="all-books-heading"
          title="All Books"
          subtitle={`${books.length} book${books.length !== 1 ? 's' : ''}`}
        />

        {books.length > 0 && (
          <div className="library-page__toolbar">
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        )}

        <BookGrid
          books={sortedBooks}
          onOpenBook={handleOpenBook}
          emptyState={
            <EmptyLibrary
              title="Your library is empty"
              description="Import your first PDF to start building your personal library. Your books are stored locally in your browser."
              buttonText={isImporting ? 'Importing...' : 'Import PDF'}
              onAction={importBook}
            />
          }
        />
      </section>

      {/* 4. Global Actions */}
      <ImportButton onImport={importBook} />
    </PageWrapper>
  );
}
