import { useDocumentTitle } from '@/hooks';
import { PageWrapper } from '@/components/ui';
import './ReaderPage.css';

/**
 * Reader placeholder page.
 * Phase 3+ will render the PDF reader, TOC, annotations, and reading controls.
 */
export function ReaderPage() {
  useDocumentTitle('Reader');

  return (
    <PageWrapper
      title="Reader"
      description="Immersive reading experience — coming soon."
    >
      <div className="reader-placeholder">
        <div className="reader-placeholder__viewport">
          <div className="reader-placeholder__page-mock" aria-hidden="true">
            <div className="reader-placeholder__line" />
            <div className="reader-placeholder__line reader-placeholder__line--short" />
            <div className="reader-placeholder__line" />
            <div className="reader-placeholder__line reader-placeholder__line--medium" />
            <div className="reader-placeholder__line" />
          </div>
        </div>
        <p className="reader-placeholder__caption">
          PDF rendering and reader controls will be implemented in a future
          phase.
        </p>
      </div>
    </PageWrapper>
  );
}
