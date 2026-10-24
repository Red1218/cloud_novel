import type { ReaderEnvironmentSettings } from '../../types';
import { ZOOM_MIN } from '../../constants';
import './ReadingEnvironmentPanel.css';

/** The zoom bar's top end; + still goes further. */
const BAR_MAX = 3;

interface ReadingEnvironmentPanelProps {
  settings: ReaderEnvironmentSettings;
  /** This book's own zoom; without one it opens with the whole page fitted. */
  openZoom?: number;
  /** The page's zoom right now. */
  zoom: number;
  /** Zoomed away from the fitted page. */
  zoomed: boolean;
  /** The zoom bar moved. */
  onZoomChange: (zoom: number) => void;
  onBrightnessChange: (brightness: number) => void;
  /** Makes the zoom right now this book's own. */
  onSaveZoom: () => void;
  /** Back to fitting the whole page. */
  onClearZoom: () => void;
  onAutoHideControlsChange: (autoHideControls: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}

function renderIcon(icon: 'moon' | 'sun') {
  return icon === 'moon' ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 7.2 9 9 0 1 1-9-7.2Z" />
    </svg>
) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93 6.34 6.34" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);
}

const percent = (scale: number) => `${Math.round(scale * 100)}%`;

export function ReadingEnvironmentPanel({
  settings,
  openZoom,
  zoom,
  zoomed,
  onZoomChange,
  onBrightnessChange,
  onSaveZoom,
  onClearZoom,
  onAutoHideControlsChange,
  onReset,
  onClose,
}: ReadingEnvironmentPanelProps) {
  // Offer the zoom right now only when it differs from what the book opens at.
  const canSave = zoomed && percent(zoom) !== (openZoom ? percent(openZoom) : undefined);

  return (
    <section className="reading-environment">
      <div className="reading-environment__handle" aria-hidden="true" />

      <header className="reading-environment__header">
        <h2 id="reading-environment-title" className="reading-environment__title">
          Reading
        </h2>
        <button
          type="button"
          className="reading-environment__close"
          onClick={onClose}
          aria-label="Close reading environment"
          title="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.25"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <div className="reading-environment__section">
        <div className="reading-environment__section-row">
          <h3 className="reading-environment__section-title">Zoom</h3>
          <span className="reading-environment__value">{percent(zoom)}</span>
        </div>
        <input
          className="reading-environment__slider"
          type="range"
          min={ZOOM_MIN * 100}
          max={BAR_MAX * 100}
          step="5"
          value={Math.min(BAR_MAX * 100, Math.round(zoom * 20) * 5)}
          onChange={(event) => onZoomChange(event.currentTarget.valueAsNumber / 100)}
          aria-label="Zoom"
          aria-valuetext={percent(zoom)}
        />
        <div className="reading-environment__setting-row">
          <span className="reading-environment__setting-label">
            Opens at <strong className="reading-environment__opens-at">{openZoom ? percent(openZoom) : 'Fit screen'}</strong>
          </span>
          {canSave ? (
            <button type="button" className="reading-environment__segment reading-environment__segment--active" onClick={onSaveZoom}>
              Use {percent(zoom)}
            </button>
          ) : openZoom ? (
            <button type="button" className="reading-environment__segment" onClick={onClearZoom}>
              Back to fit screen
            </button>
          ) : null}
        </div>
        {!openZoom && !canSave && (
          <p className="reading-environment__hint">Drag the bar until the page reads well, then keep that zoom for this book.</p>
        )}
      </div>

      <div className="reading-environment__section">
        <div className="reading-environment__section-row">
          <h3 className="reading-environment__section-title">Brightness</h3>
          <span className="reading-environment__value">
            {settings.brightness}%
          </span>
        </div>
        <label className="reading-environment__slider-row">
          <span className="reading-environment__slider-icon" aria-hidden="true">
            {renderIcon('moon')}
          </span>
          <input
            className="reading-environment__slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.brightness}
            onChange={(event) => onBrightnessChange(event.currentTarget.valueAsNumber)}
            aria-label="Reading environment brightness"
          />
          <span className="reading-environment__slider-icon" aria-hidden="true">
            {renderIcon('sun')}
          </span>
        </label>
      </div>

      <div className="reading-environment__section">
        <label className="reading-environment__setting-row reading-environment__setting-row--toggle">
          <span className="reading-environment__setting-label">Auto-hide Controls</span>
          <input
            className="reading-environment__toggle"
            type="checkbox"
            checked={settings.autoHideControls}
            onChange={(event) => onAutoHideControlsChange(event.currentTarget.checked)}
          />
        </label>
      </div>

      <button
        type="button"
        className="reading-environment__reset"
        onClick={onReset}
      >
        Reset to Default Settings
      </button>
    </section>
  );
}
