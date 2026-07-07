import { useDocumentTitle, useLibrary } from '@/hooks';
import { PageWrapper } from '@/components/ui';
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
 * Integrates the useLibrary hook for IndexedDB persistence and PDF import.
 */
export function LibraryPage() {
  useDocumentTitle('Library');

  const { books, isLoading, isImporting, importBook } = useLibrary();

  // For Phase 3, we still use mock stats until reading stats logic is built in Phase 4.
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
        <SectionHeader 
          title="All Books" 
          subtitle={isLoading ? 'Loading library...' : `${books.length} book${books.length !== 1 ? 's' : ''}`}
        />

        <div className="library-page__toolbar">
          <LibraryToolbar
            search={{ onChange: (v) => console.log('Search:', v) }}
            sort={{ onChange: (v) => console.log('Sort:', v) }}
            filter={{ onClick: () => console.log('Filter clicked') }}
          />
        </div>

        <BookGrid
          books={books}
          onOpenBook={(book) => console.log('Opening book:', book.title)}
          emptyState={
            <EmptyLibrary
              title="Your library is empty"
              description="Click the import button below to add your first PDF."
              buttonText={isImporting ? 'Importing...' : 'Import PDF'}
              onAction={importBook}
            />
          }
        />
      </section>

      {/* 3. Global Actions */}
      <ImportButton onImport={importBook} />
    </PageWrapper>
  );
}
