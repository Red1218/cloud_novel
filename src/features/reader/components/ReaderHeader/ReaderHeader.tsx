import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import './ReaderHeader.css';

interface ReaderHeaderProps {
  title?:       string;
  currentPage?: number;
  totalPages?:  number;
  /** Effective zoom as a multiplier (1.0 = 100%). */
  zoom?:        number;
  onPrevPage?:  () => void;
  onNextPage?:  () => void;
  onZoomIn?:    () => void;
  onZoomOut?:   () => void;
  onResetZoom?: () => void;
  onFitWidth?:  () => void;
  onFitPage?:   () => void;
}

export function ReaderHeader({
  title,
  currentPage = 0,
  totalPages  = 0,
  zoom        = 1,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  onFitPage,
}: ReaderHeaderProps) {
  const navigate = useNavigate();
  const hasPages = totalPages > 0;
  const zoomPct  = useMemo(() => Math.round(zoom * 100), [zoom]);

  return (
    <header className="reader-header">

      {/* ── Left: Back ── */}
      <div className="reader-header__left">
        <button
          type="button"
          className="reader-header__back-btn"
          onClick={() => navigate(ROUTES.LIBRARY)}
          aria-label="Back to Library"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="reader-header__back-text">Back to Library</span>
        </button>
      </div>

      {/* ── Center: Title ── */}
      <div className="reader-header__center">
        <h1 className="reader-header__title" title={title}>
          {title ?? 'Loading...'}
        </h1>
      </div>

      {/* ── Right: Navigation + Zoom ── */}
      <div className="reader-header__right">

        {/* Pagination pill */}
        {hasPages && (
          <div className="reader-header__pagination">
            <button
              type="button"
              className="reader-header__page-btn"
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              aria-label="Previous Page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span className="reader-header__page-info">
              <span className="reader-header__page-label">Page </span>
              {currentPage}
              <span className="reader-header__page-label"> of </span>
              <span className="reader-header__page-slash">/</span>
              {totalPages}
            </span>

            <button
              type="button"
              className="reader-header__page-btn"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
              aria-label="Next Page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Zoom pill */}
        {hasPages && (
          <div className="reader-header__zoom-controls">
            <button
              type="button"
              className="reader-header__zoom-btn"
              onClick={onZoomOut}
              aria-label="Zoom Out"
              title="Zoom Out (Ctrl −)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <span
              className="reader-header__zoom-display"
              aria-label={`Zoom level: ${zoomPct}%`}
            >
              {zoomPct}%
            </span>

            <button
              type="button"
              className="reader-header__zoom-btn"
              onClick={onZoomIn}
              aria-label="Zoom In"
              title="Zoom In (Ctrl +)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5"  y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Fit and reset presets — hidden on narrow viewports */}
            <div className="reader-header__zoom-presets">
              <button
                type="button"
                className="reader-header__zoom-preset-btn"
                onClick={onFitWidth}
                aria-label="Fit Width"
                title="Fit Width"
              >
                Fit W
              </button>
              <button
                type="button"
                className="reader-header__zoom-preset-btn"
                onClick={onFitPage}
                aria-label="Fit Page"
                title="Fit Page"
              >
                Fit P
              </button>
              <button
                type="button"
                className="reader-header__zoom-preset-btn"
                onClick={onResetZoom}
                aria-label="Reset Zoom to 100%"
                title="Reset Zoom (Ctrl 0)"
              >
                100%
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
