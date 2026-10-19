import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle, useLibrary } from '@/hooks';
import { PageWrapper } from '@/components/ui';
import { ROUTES } from '@/constants';
import { BookCover, BookGrid, EmptyLibrary, SectionHeader } from '@/components/library';
import {
  deriveContinueReadingBooks,
  formatRelativeTime,
  sortBooks,
} from '@/features/library/utils';
import './DashboardPage.css';

const RECENTLY_ADDED_MAX = 4;

/**
 * Home page: resume the latest book in progress and see recent imports.
 * Reading statistics arrive with Phase 5.6 (Reading Insights).
 */
export function DashboardPage() {
  useDocumentTitle('Home');

  const navigate = useNavigate();
  const { books, isLoading, isImporting, importBook } = useLibrary();

  const [current, ...otherInProgress] = useMemo(
    () => deriveContinueReadingBooks(books),
    [books]
  );
  const recentlyAdded = useMemo(
    () => sortBooks(books, 'recentlyAdded').slice(0, RECENTLY_ADDED_MAX),
    [books]
  );

  const openBook = (bookId: string) => navigate(`${ROUTES.READER}/${bookId}`);

  if (isLoading) {
    return <PageWrapper title="Home" />;
  }

  if (books.length === 0) {
    return (
      <PageWrapper title="Home">
        <EmptyLibrary
          title="Nothing on your shelf yet"
          description="Import a PDF and it stays in this browser: no account, no upload. Your page, zoom and bookmarks are remembered for every book."
          buttonText={isImporting ? 'Importing…' : 'Import a PDF'}
          onAction={importBook}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Home">
      {current && (
        <section className="resume" aria-labelledby="resume-heading">
          <button
            type="button"
            className="resume__cover"
            onClick={() => openBook(current.id)}
            aria-label={`Resume ${current.title}`}
          >
            <BookCover src={current.thumbnail} title={current.title} />
          </button>

          <div className="resume__body">
            <p className="resume__eyebrow">
              Last read {formatRelativeTime(current.lastOpened)}
            </p>
            <h2 id="resume-heading" className="resume__title">
              {current.title}
            </h2>
            {current.author && <p className="resume__author">{current.author}</p>}

            <div className="resume__progress">
              <div
                className="resume__bar"
                role="progressbar"
                aria-valuenow={current.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Reading progress: ${Math.round(current.progress)}%`}
              >
                <div className="resume__fill" style={{ width: `${current.progress}%` }} />
              </div>
              <span className="resume__pages">
                Page {current.currentPage ?? 1} of {current.pageCount}
              </span>
            </div>

            <button
              type="button"
              className="resume__action"
              onClick={() => openBook(current.id)}
            >
              Continue reading
            </button>
          </div>
        </section>
      )}

      {otherInProgress.length > 0 && (
        <section className="dashboard__section" aria-labelledby="in-progress-heading">
          <SectionHeader id="in-progress-heading" title="Also reading" />
          <BookGrid books={otherInProgress} onOpenBook={openBook} />
        </section>
      )}

      <section className="dashboard__section" aria-labelledby="recent-heading">
        <SectionHeader
          id="recent-heading"
          title="Recently added"
          actions={
            <Link to={ROUTES.LIBRARY} className="dashboard__link">
              View library ({books.length})
            </Link>
          }
        />
        <BookGrid books={recentlyAdded} onOpenBook={openBook} />
      </section>
    </PageWrapper>
  );
}
