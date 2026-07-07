import { useDocumentTitle } from '@/hooks';
import { PageWrapper } from '@/components/ui';
import './DashboardPage.css';

/**
 * Dashboard placeholder page.
 * Phase 2+ will add reading statistics, recent books, and continue-reading widgets.
 */
export function DashboardPage() {
  useDocumentTitle('Dashboard');

  return (
    <PageWrapper
      title="Dashboard"
      description="An overview of your reading activity and library."
    >
      <div className="dashboard-grid">
        <article className="placeholder-card">
          <div className="placeholder-card__icon" aria-hidden="true">
            &#128202;
          </div>
          <h2 className="placeholder-card__title">Reading Statistics</h2>
          <p className="placeholder-card__body">
            Track pages read, time spent, and reading streaks. Coming in a
            future phase.
          </p>
        </article>

        <article className="placeholder-card">
          <div className="placeholder-card__icon" aria-hidden="true">
            &#128218;
          </div>
          <h2 className="placeholder-card__title">Recent Books</h2>
          <p className="placeholder-card__body">
            Your most recently opened books will appear here once the library
            is connected.
          </p>
        </article>

        <article className="placeholder-card">
          <div className="placeholder-card__icon" aria-hidden="true">
            &#128278;
          </div>
          <h2 className="placeholder-card__title">Continue Reading</h2>
          <p className="placeholder-card__body">
            Pick up exactly where you left off. Bookmarks sync with your cloud
            library.
          </p>
        </article>
      </div>
    </PageWrapper>
  );
}
