import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle, useLibrary } from '@/hooks';
import { PageWrapper } from '@/components/ui';
import { ROUTES } from '@/constants';
import {
  SectionHeader,
  StatsCard,
  LibraryToolbar,
  BookGrid,
  EmptyLibrary,
  ImportButton,
} from '@/components/library';
import {
  deriveContinueReadingBooks,
  sortBooks,
  deriveLibraryStats,
  DEFAULT_SKELETON_COUNT,
  type SortOption,
} from '@/features/library/utils';

import './LibraryPage.css';

const SORT_MAP: Readonly<Record<string, SortOption>> = {
  recent: 'recentlyAdded',
  opened: 'lastOpened',
  title: 'title',
};

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
    { label: 'Total Books', value: stats.totalBooks, icon: '\u{1F4DA}' }, // 📚
    { label: 'Reading', value: stats.reading, icon: '\u{1F4D6}' }, // 📖
    { label: 'Finished', value: stats.finished, icon: '\u2705' }, // ✅
  ];

  // Handle sort change from SortDropdown
  const handleSortChange = (value: string) => {
    const mappedSort = SORT_MAP[value];
    if (mappedSort) {
      setSortBy(mappedSort);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <PageWrapper title="Library" description="All your books in one place.">
        <section className="library-page__main">
          <SectionHeader title="All Books" subtitle="Loading library..." />
          <div className="book-grid book-grid--loading">
            {Array.from({ length: DEFAULT_SKELETON_COUNT }).map((_, index) => (
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
            {/* Filter props are omitted here; LibraryToolbar still owns that shared control API. */}
            <LibraryToolbar
              search={{ onChange: (v) => console.log('Search:', v) }}
              sort={{
                value: sortBy === 'recentlyAdded' ? 'recent' : sortBy === 'lastOpened' ? 'opened' : 'title',
                onChange: handleSortChange
              }}
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
