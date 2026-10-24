import { useState, type CSSProperties } from 'react';
import './ReaderToolbar.css';

interface ReaderToolbarProps {
  currentPage:  number;
  totalPages:   number;
  onPrevPage:   () => void;
  onNextPage:   () => void;
  /** Jumps straight to a page (the scrubber, on release). */
  onGoToPage:   (page: number) => void;
  /** Effective zoom as a multiplier (1.0 = 100%). */
  zoom:         number;
  onZoomIn:     () => void;
  onZoomOut:    () => void;
  onResetZoom:  () => void;
  onOpenReadingEnvironment: () => void;
}

/**
 * Bottom reader bar, three rows: where you are and how much is left; a
 * full-width page scrubber; then page turning, zoom, and "Aa" for themes,
 * brightness and fit (the reading environment sheet).
 */
export function ReaderToolbar({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenReadingEnvironment,
}: ReaderToolbarProps) {
  const zoomPct = Math.round(zoom * 100);
  /** The page under the finger while scrubbing; null when not scrubbing. */
  const [scrub, setScrub] = useState<number | null>(null);
  const shown = scrub ?? currentPage;
  const progress = totalPages > 0 ? Math.round((shown / totalPages) * 100) : 0;
  const commit = () => {
    if (scrub !== null && scrub !== currentPage) onGoToPage(scrub);
    setScrub(null);
  };

  const left = totalPages - currentPage;
  /** Where the thumb sits along the line, 0 to 1, for the bubble above it. */
  const position = totalPages > 1 ? (shown - 1) / (totalPages - 1) : 0;

  return (
    <div className="reader-toolbar" role="toolbar" aria-label="Reader controls">
      <div className="reader-toolbar__labels" aria-hidden="true">
        <span>{scrub !== null ? `Go to ${shown} of ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
        <span>{left > 0 ? `${left} ${left === 1 ? 'page' : 'pages'} left` : 'Last page'}</span>
      </div>

      {/* Drag along the line to move through many pages; the page opens on release */}
      <div
        className={`reader-toolbar__scrubber${scrub !== null ? ' reader-toolbar__scrubber--active' : ''}`}
        style={{ '--pos': position } as CSSProperties}
      >
        <div className="reader-toolbar__track" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>
        {scrub !== null && <span className="reader-toolbar__bubble" aria-hidden="true">Page {shown}</span>}
        <input
          type="range"
          className="reader-toolbar__scrub"
          min={1}
          max={Math.max(1, totalPages)}
          step={1}
          value={shown}
          disabled={totalPages < 2}
          aria-label="Go to page"
          aria-valuetext={`Page ${shown} of ${totalPages}`}
          onChange={(e) => setScrub(Number(e.target.value))}
          onPointerUp={commit}
          onPointerCancel={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
      </div>

      <div className="reader-toolbar__buttons">
        <div className="reader-toolbar__group">
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
        </div>

        <div className="reader-toolbar__group" aria-label="Zoom and reading settings">
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
          <button
            type="button"
            className="reader-toolbar__button reader-toolbar__aa"
            aria-label="Themes, brightness and zoom"
            title="Themes, brightness and zoom"
            onClick={onOpenReadingEnvironment}
          >
            Aa
          </button>
        </div>
      </div>
    </div>
  );
}
