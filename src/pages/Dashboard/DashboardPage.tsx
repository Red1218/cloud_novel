import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { BookCover } from '@/components/library/BookCover/BookCover';
import { useRecentBookmarks } from '@/features/reader/bookmarks/hooks/useRecentBookmarks';
import { ImportGroupPrompt } from '@/components/library/ImportGroupSheet/ImportGroupSheet';
import { ProfileButton } from '@/components/layout/ProfileButton/ProfileButton';
import { TurningShelf } from '@/components/library/TurningShelf/TurningShelf';
import { openLabel, upNext } from '@/features/library/utils/readingStatus';
import { formatRelativeTime } from '@/features/library/utils/formatRelativeTime';
import { sortBooks } from '@/features/library/utils/sortBooks';
import './DashboardPage.css';

const BOOKMARKS_MAX = 4;
const NOW_SHELF_MAX = 6;

/**
 * Home: a shelf of what you are reading, where one book turns out to show
 * its cover and how far you are, then your latest bookmarks across books.
 * Reading statistics arrive with Phase 5.6 (Reading Insights).
 */
export function DashboardPage() {
  useDocumentTitle('Home');

  const navigate = useNavigate();
  const library = useLibrary();
  const { books, isLoading } = library;

  // Books in progress (last read first), then Up next in queue order, topped
  // up with unread recent imports. Set-aside (Not now) books never show.
  const nowShelf = useMemo(() => {
    const kept = books.filter((b) => b.intent !== 'later');
    const reading = sortBooks(kept.filter((b) => b.progress > 0 && b.progress < 100), 'lastOpened');
    const queued = upNext(kept).filter((b) => !reading.includes(b));
    const unread = sortBooks(kept.filter((b) => b.progress === 0 && b.intent !== 'next'), 'recentlyAdded');
    return [...reading, ...queued, ...unread].slice(0, NOW_SHELF_MAX);
  }, [books]);
  const [openId, setOpenId] = useState<string>();
  const selected = nowShelf.find((b) => b.id === openId) ?? nowShelf[0];
  const allBookmarks = useRecentBookmarks();
  // Newest first, skipping bookmarks whose book has been removed.
  const bookmarks = useMemo(() => {
    const byId = new Map(books.map((b) => [b.id, b]));
    return allBookmarks
      .flatMap((bookmark) => {
        const book = byId.get(bookmark.bookId);
        return book ? [{ bookmark, book }] : [];
      })
      .slice(0, BOOKMARKS_MAX);
  }, [allBookmarks, books]);

  const openBook = (bookId: string, page?: number) =>
    navigate(`${ROUTES.READER}/${bookId}${page ? `?page=${page}` : ''}`);

  return (
    <div className="home paper-page">
      <header className="paper-header">
        <h1 className="paper-title">Home</h1>
        <ProfileButton />
      </header>

      {!isLoading && books.length === 0 && (
        <div className="paper-note">
          <p className="paper-note__title">Nothing on your shelf yet</p>
          <p>Add PDFs in your Library: they stay on this device, with no account and no upload. Your page, zoom and bookmarks are remembered for every book.</p>
          <Link to={ROUTES.LIBRARY} className="pill pill--filled home__to-library">Go to Library</Link>
        </div>
      )}

      {selected && (
        <section className="home__hero" aria-labelledby="now-heading">
          <span className="orb" aria-hidden="true" />
          <h2 id="now-heading" className="badge">{selected.intent === 'next' ? 'Up next' : 'Reading now'}</h2>
          <TurningShelf books={nowShelf} openId={selected.id} onOpen={setOpenId} />
          <div className="home__now" aria-live="polite">
            <h3 className="home__current-title">{selected.title}</h3>
            <p className="home__author">
              {[
                selected.author,
                selected.progress > 0
                  ? `page ${selected.currentPage ?? 1} of ${selected.pageCount}`
                  : `${selected.pageCount} pages`,
              ].filter(Boolean).join(', ')}
            </p>
            <div className="home__actions">
              <button type="button" className="pill pill--filled home__continue" onClick={() => openBook(selected.id)}>
                {openLabel(selected)}
              </button>
              <Link to={`${ROUTES.LIBRARY}?book=${selected.id}`} className="pill pill--outline">Details</Link>
            </div>
          </div>
        </section>
      )}

      {books.length > 0 && (
        <section className="home__section" aria-labelledby="bookmarks-heading">
          <h2 id="bookmarks-heading" className="paper-eyebrow">Your bookmarks</h2>
          {bookmarks.length === 0 ? (
            <p className="home__bookmarks-empty">Bookmarks you add while reading show up here.</p>
          ) : (
            <ul className="home__bookmarks" role="list">
              {bookmarks.map(({ bookmark, book }) => {
                const when = formatRelativeTime(bookmark.createdAt);
                return (
                  <li key={bookmark.id}>
                    <button type="button" className="home__bookmark" onClick={() => openBook(book.id, bookmark.page)}>
                      <span className="home__bookmark-cover">
                        <BookCover src={book.thumbnail} title={book.title} />
                      </span>
                      <span className="home__bookmark-text">
                        <span className="home__bookmark-title">{bookmark.label ?? `Page ${bookmark.page}`}</span>
                        <span className="home__bookmark-meta">
                          {bookmark.label ? `${book.title}, page ${bookmark.page}, ${when}` : `${book.title}, ${when}`}
                        </span>
                      </span>
                      <svg className="home__bookmark-icon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                        <path d="M6 3h12v18l-6-4-6 4z" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
      <ImportGroupPrompt
        books={books}
        lastImportedIds={library.lastImportedIds}
        onApply={library.applyCollectionUpdates}
        onClose={library.clearLastImported}
      />
    </div>
  );
}
