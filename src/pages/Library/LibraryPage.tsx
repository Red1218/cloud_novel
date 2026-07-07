import { useDocumentTitle } from '@/hooks';
import { PageWrapper } from '@/components/ui';
import './LibraryPage.css';

/**
 * Library placeholder page.
 * Phase 2+ will render a book grid with upload, search, and sort controls.
 */
export function LibraryPage() {
  useDocumentTitle('Library');

  return (
    <PageWrapper
      title="Library"
      description="All your books in one place."
    >
      <div className="library-empty-state">
        <div className="library-empty-state__icon" aria-hidden="true">
          &#128218;
        </div>
        <h2 className="library-empty-state__heading">Your library is empty</h2>
        <p className="library-empty-state__body">
          Book management and PDF upload will be available in a future phase.
          Your entire collection will appear here.
        </p>
      </div>
    </PageWrapper>
  );
}
