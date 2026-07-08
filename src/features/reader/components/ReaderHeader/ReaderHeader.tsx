import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import './ReaderHeader.css';

interface ReaderHeaderProps {
  title?: string;
  currentPage?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export function ReaderHeader({ 
  title, 
  currentPage = 0, 
  totalPages = 0, 
  onPrevPage, 
  onNextPage 
}: ReaderHeaderProps) {
  const navigate = useNavigate();
  const hasPages = totalPages > 0;

  return (
    <header className="reader-header">
      <div className="reader-header__left">
        <button 
          type="button" 
          className="reader-header__back-btn" 
          onClick={() => navigate(ROUTES.LIBRARY)}
          aria-label="Back to Library"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="reader-header__back-text">Back to Library</span>
        </button>
      </div>
      
      <div className="reader-header__center">
        <h1 className="reader-header__title" title={title}>
          {title || 'Loading...'}
        </h1>
      </div>
      
      <div className="reader-header__right">
        {hasPages && (
          <div className="reader-header__pagination">
            <button
              type="button"
              className="reader-header__page-btn"
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              aria-label="Previous Page"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span className="reader-header__page-info">
              <span className="reader-header__page-label">Page </span>
              {currentPage}
              <span className="reader-header__page-label"> of </span>
              <span className="reader-header__page-slash"> / </span>
              {totalPages}
            </span>
            <button
              type="button"
              className="reader-header__page-btn"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
              aria-label="Next Page"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
