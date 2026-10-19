import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import './NotFoundPage.css';

/**
 * 404 Not Found page.
 *
 * Rendered outside the AppLayout so it is fully standalone.
 */
export function NotFoundPage() {
  useDocumentTitle('404 Not Found');

  return (
    <div className="not-found">
      <div className="not-found__card">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__message">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link
          id="not-found-home-link"
          to={ROUTES.DASHBOARD}
          className="not-found__link"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
