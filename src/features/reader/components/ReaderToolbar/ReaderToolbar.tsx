import { useMemo } from 'react';
import './ReaderToolbar.css';

interface ReaderToolbarProps {
  /** Effective zoom as a multiplier (1.0 = 100%). */
  zoom:         number;
  onZoomIn:     () => void;
  onZoomOut:    () => void;
  onResetZoom:  () => void;
  onFitWidth:   () => void;
  onFitPage:    () => void;
  onOpenReadingEnvironment: () => void;
}

export function ReaderToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  onFitPage,
  onOpenReadingEnvironment,
}: ReaderToolbarProps) {
  const zoomPct = useMemo(() => Math.round(zoom * 100), [zoom]);

  return (
    <div className="reader-toolbar" role="toolbar" aria-label="Reader controls">
      <button
        type="button"
        className="reader-toolbar__button"
        aria-label="Theme settings"
        title="Theme"
        onClick={onOpenReadingEnvironment}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 7.2 9 9 0 1 1-9-7.2Z" />
        </svg>
      </button>

      <button
        type="button"
        className="reader-toolbar__button"
        aria-label="Brightness settings"
        title="Brightness"
        onClick={onOpenReadingEnvironment}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
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

      <div className="reader-toolbar__divider reader-toolbar__divider--wide" aria-hidden="true" />

      <button
        type="button"
        className="reader-toolbar__button reader-toolbar__button--preset"
        onClick={onFitWidth}
        aria-label="Fit width"
        title="Fit width"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 8V5h3" />
          <path d="M20 8V5h-3" />
          <path d="M4 16v3h3" />
          <path d="M20 16v3h-3" />
          <path d="M8 12h8" />
          <path d="m10 10-2 2 2 2" />
          <path d="m14 10 2 2-2 2" />
        </svg>
      </button>

      <button
        type="button"
        className="reader-toolbar__button reader-toolbar__button--preset"
        onClick={onFitPage}
        aria-label="Fit page"
        title="Fit page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="7" y="3" width="10" height="18" rx="1.5" />
          <path d="M10 7h4" />
          <path d="M10 11h4" />
          <path d="M10 15h3" />
        </svg>
      </button>

      <button
        type="button"
        className="reader-toolbar__button"
        aria-label="Reading environment"
        title="Reading environment"
        onClick={onOpenReadingEnvironment}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H2a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 9.4 1.92V2a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8c.38.18.72.4 1 .72.3.3.49.68.6 1.08H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      </button>
    </div>
  );
}
