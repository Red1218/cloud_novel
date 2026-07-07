import { useDocumentTitle } from '@/hooks';
import { PageWrapper } from '@/components/ui';
import { MOCK_BOOKS } from '@/mocks/books';
import { MOCK_LIBRARY_STATS } from '@/mocks/libraryStats';
import {
  SectionHeader,
  StatsCard,
  LibraryToolbar,
  BookGrid,
  EmptyLibrary,
  ImportButton,
} from '@/components/library';
import './LibraryPage.css';

/**
 * Library page composing the domain components.
 * UI only - uses mock data and placeholder callbacks.
 */
export function LibraryPage() {
  useDocumentTitle('Library');

  // In Phase 3, MOCK_BOOKS will be replaced by a hook, e.g. useLibrary()
  const books = MOCK_BOOKS;
  const stats = MOCK_LIBRARY_STATS;

  return (
    <PageWrapper title="Library" description="All your books in one place.">
      {/* 1. Statistics Row */}
      {books.length > 0 && (
        <section className="library-page__stats">
          {stats.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </section>
      )}

      {/* 2. Main Library Area */}
      <section className="library-page__main">
        <SectionHeader title="All Books" />

        <div className="library-page__toolbar">
          <LibraryToolbar
            search={{ onChange: (v) => console.log('Search:', v) }}
            sort={{ onChange: (v) => console.log('Sort:', v) }}
            filter={{ onClick: () => console.log('Filter clicked') }}
          />
        </div>

        <BookGrid
          books={books}
          onOpenBook={(book) => console.log('Opening book:', book.id)}
          emptyState={
            <EmptyLibrary
              title="Your library is empty"
              description="Book management and PDF upload will be available in a future phase. Your entire collection will appear here."
              buttonText="Import PDF"
              onAction={() => console.log('Import PDF coming in Phase 3')}
            />
          }
        />
      </section>

      {/* 3. Global Actions */}
      <ImportButton onImport={() => console.log('Import PDF coming in Phase 3')} />
    </PageWrapper>
  );
}
