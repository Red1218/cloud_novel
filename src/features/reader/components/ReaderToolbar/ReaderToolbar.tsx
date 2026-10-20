import './ReaderToolbar.css';

interface ReaderToolbarProps {
  currentPage:  number;
  totalPages:   number;
  onPrevPage:   () => void;
  onNextPage:   () => void;
  /** Effective zoom as a multiplier (1.0 = 100%). */
  zoom:         number;
  onZoomIn:     () => void;
  onZoomOut:    () => void;
  onResetZoom:  () => void;
  onOpenReadingEnvironment: () => void;
}

/**
 * Bottom reader bar: page turning with a progress line, zoom, and "Aa" for
 * themes, brightness and fit (the reading environment sheet).
 */
export function ReaderToolbar({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenReadingEnvironment,
}: ReaderToolbarProps) {
  const zoomPct = Math.round(zoom * 100);
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="reader-toolbar" role="toolbar" aria-label="Reader controls">
      <button
        type="button"
        className="reader-toolbar__button"
        onClick={onPrevPage}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        title="Previous page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>

      <div className="reader-toolbar__progress">
        <div className="reader-toolbar__track" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>
        <span className="reader-toolbar__page">
          <span className="reader-toolbar__page-word">Page </span>
          {currentPage} of {totalPages}
        </span>
      </div>

      <button
        type="button"
        className="reader-toolbar__button"
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        title="Next page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>

      <div className="reader-toolbar__divider" aria-hidden="true" />

      <div className="reader-toolbar__zoom-group" aria-label="Zoom controls">
        <button
          type="button"
          className="reader-toolbar__button"
          onClick={onZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.25"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button
          type="button"
          className="reader-toolbar__zoom-value"
          onClick={onResetZoom}
          aria-label={`Reset zoom to 100 percent. Current zoom ${zoomPct} percent`}
          title="Reset zoom"
        >
          {zoomPct}%
        </button>

        <button
          type="button"
          className="reader-toolbar__button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.25"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="reader-toolbar__button reader-toolbar__aa"
        aria-label="Themes, brightness and fit"
        title="Themes, brightness and fit"
        onClick={onOpenReadingEnvironment}
      >
        Aa
      </button>
    </div>
  );
}
