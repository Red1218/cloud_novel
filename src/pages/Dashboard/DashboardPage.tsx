import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { ROUTES } from '@/constants/routes';
import { ShelfRail } from '@/components/library/BookShelves/ShelfRail';
import { ImportGroupPrompt } from '@/components/library/ImportGroupSheet/ImportGroupSheet';
import { TurningShelf } from '@/components/library/TurningShelf/TurningShelf';
import { openLabel } from '@/features/library/utils/readingStatus';
import { formatRelativeTime } from '@/features/library/utils/formatRelativeTime';
import { sortBooks } from '@/features/library/utils/sortBooks';
import './DashboardPage.css';

const RECENTLY_ADDED_MAX = 6;
const NOW_SHELF_MAX = 6;

/**
 * Home: a shelf of what you are reading, where one book turns out to show
 * its cover and how far you are, then recent imports.
 * Reading statistics arrive with Phase 5.6 (Reading Insights).
 */
export function DashboardPage() {
  useDocumentTitle('Home');

  const navigate = useNavigate();
  const library = useLibrary();
  const { books, isLoading } = library;

  // Books in progress (last read first), topped up with unread recent imports.
  const nowShelf = useMemo(() => {
    const reading = sortBooks(books.filter((b) => b.progress > 0 && b.progress < 100), 'lastOpened');
    const unread = sortBooks(books.filter((b) => b.progress === 0), 'recentlyAdded');
    return [...reading, ...unread].slice(0, NOW_SHELF_MAX);
  }, [books]);
  const [openId, setOpenId] = useState<string>();
  const selected = nowShelf.find((b) => b.id === openId) ?? nowShelf[0];
  const recentlyAdded = useMemo(
    () => sortBooks(books, 'recentlyAdded').slice(0, RECENTLY_ADDED_MAX),
    [books]
  );

  const openBook = (bookId: string) => navigate(`${ROUTES.READER}/${bookId}`);

  return (
    <div className="home paper-page">
      <header className="paper-header">
        <h1 className="paper-title">Home</h1>
      </header>

      {!isLoading && books.length === 0 && (
        <div className="paper-note">
          <p className="paper-note__title">Nothing on your shelf yet</p>
          <p>Add PDFs in your Library: they stay on this device, with no account and no upload. Your page, zoom and bookmarks are remembered for every book.</p>
          <Link to={ROUTES.LIBRARY} className="pill pill--filled home__to-library">Go to Library</Link>
        </div>
      )}

      {selected && (
        <section className="home__section" aria-labelledby="now-heading">
          <h2 id="now-heading" className="paper-eyebrow">Reading now</h2>
          <TurningShelf books={nowShelf} openId={selected.id} onOpen={setOpenId} />
          <div className="home__now" aria-live="polite">
            <h3 className="home__current-title">{selected.title}</h3>
            <p className="home__author">
              {selected.author ?? 'Unknown author'}
              {selected.lastOpened ? ` · read ${formatRelativeTime(selected.lastOpened)}` : ' · not started'}
            </p>
            <div className="paper-progress home__progress">
              <div
                className="paper-progress__bar"
                role="progressbar"
                aria-valuenow={Math.round(selected.progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Reading progress: ${Math.round(selected.progress)}%`}
              >
                <div style={{ width: `${selected.progress}%` }} />
              </div>
              <span className="paper-progress__label">
                {selected.progress > 0 ? `${selected.currentPage ?? 1} / ${selected.pageCount}` : `${selected.pageCount} pages`}
              </span>
            </div>
            <button type="button" className="pill pill--filled home__continue" onClick={() => openBook(selected.id)}>
              {openLabel(selected)}
            </button>
          </div>
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
          <ShelfRail books={recentlyAdded} label="Recently added" onPick={openBook} />
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
