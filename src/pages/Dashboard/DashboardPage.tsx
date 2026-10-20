import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { BookCover } from '@/components/library/BookCover/BookCover';
import { deriveContinueReadingBooks } from '@/features/library/utils/deriveContinueReadingBooks';
import { formatRelativeTime } from '@/features/library/utils/formatRelativeTime';
import { sortBooks } from '@/features/library/utils/sortBooks';
import './DashboardPage.css';

const RECENTLY_ADDED_MAX = 6;

/**
 * Home: the book you are reading, the others in progress, and recent imports.
 * Reading statistics arrive with Phase 5.6 (Reading Insights).
 */
export function DashboardPage() {
  useDocumentTitle('Home');

  const navigate = useNavigate();
  const { books, isLoading, isImporting, importBook } = useLibrary();

  const [current, ...alsoReading] = useMemo(() => deriveContinueReadingBooks(books), [books]);
  const recentlyAdded = useMemo(
    () => sortBooks(books, 'recentlyAdded').slice(0, RECENTLY_ADDED_MAX),
    [books]
  );

  const openBook = (bookId: string) => navigate(`${ROUTES.READER}/${bookId}`);

  return (
    <div className="home paper-page">
      <header className="paper-header">
        <h1 className="paper-title">Home</h1>
        <button type="button" className="pill pill--outline" onClick={importBook} disabled={isImporting}>
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {isImporting ? 'Importing…' : 'Import'}
        </button>
      </header>

      {!isLoading && books.length === 0 && (
        <div className="paper-note">
          <p className="paper-note__title">Nothing on your shelf yet</p>
          <p>Import a PDF and it stays on this device: no account, no upload. Your page, zoom and bookmarks are remembered for every book.</p>
        </div>
      )}

      {current && (
        <section className="home__section" aria-labelledby="continue-heading">
          <h2 id="continue-heading" className="paper-eyebrow">Continue reading</h2>
          <div className="home__current">
            <button type="button" className="home__current-cover" onClick={() => openBook(current.id)} aria-label={`Open ${current.title}`}>
              <BookCover src={current.thumbnail} title={current.title} />
            </button>
            <div className="home__current-info">
              <p className="home__when">Last read {formatRelativeTime(current.lastOpened)}</p>
              <h3 className="home__current-title">{current.title}</h3>
              {current.author && <p className="home__author">{current.author}</p>}
              <div className="paper-progress home__progress">
                <div
                  className="paper-progress__bar"
                  role="progressbar"
                  aria-valuenow={Math.round(current.progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Reading progress: ${Math.round(current.progress)}%`}
                >
                  <div style={{ width: `${current.progress}%` }} />
                </div>
                <span className="paper-progress__label">
                  {current.currentPage ?? 1} / {current.pageCount}
                </span>
              </div>
              <button type="button" className="pill pill--filled home__continue" onClick={() => openBook(current.id)}>
                Continue reading
              </button>
            </div>
          </div>
        </section>
      )}

      {alsoReading.length > 0 && (
        <section className="home__section" aria-labelledby="also-heading">
          <h2 id="also-heading" className="paper-eyebrow">Also reading</h2>
          <ul className="home__list" role="list">
            {alsoReading.map((book) => (
              <li key={book.id}>
                <button type="button" className="home__row" onClick={() => openBook(book.id)}>
                  <span className="home__row-cover">
                    <BookCover src={book.thumbnail} title={book.title} />
                  </span>
                  <span className="home__row-text">
                    <span className="home__row-title">{book.title}</span>
                    <span className="home__row-meta">
                      {book.author ? `${book.author} · ` : ''}page {book.currentPage ?? 1} of {book.pageCount}
                    </span>
                  </span>
                  <span className="home__row-pct">{Math.round(book.progress)}%</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recentlyAdded.length > 0 && (
        <section className="home__section" aria-labelledby="added-heading">
          <div className="home__section-head">
            <h2 id="added-heading" className="paper-eyebrow">Recently added</h2>
            <Link to={ROUTES.LIBRARY} className="home__see-all">
              See all {books.length}
            </Link>
          </div>
          <div className="home__shelf">
            {recentlyAdded.map((book) => (
              <button
                key={book.id}
                type="button"
                className="home__shelf-book"
                onClick={() => openBook(book.id)}
                aria-label={book.author ? `${book.title}, ${book.author}` : book.title}
              >
                <BookCover src={book.thumbnail} title={book.title} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
