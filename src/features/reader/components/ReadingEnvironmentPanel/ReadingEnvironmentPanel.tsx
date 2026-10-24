import type { ReaderEnvironmentSettings, ReaderTheme } from '../../types';
import './ReadingEnvironmentPanel.css';

interface ReadingPreset {
  id: string;
  label: string;
  description: string;
  theme: ReaderTheme;
  brightness: number;
  icon: 'moon' | 'book' | 'sun' | 'focus';
}

interface ThemeOption {
  id: ReaderTheme;
  label: string;
  description: string;
}

interface ReadingEnvironmentPanelProps {
  settings: ReaderEnvironmentSettings;
  /** This book's own zoom; without one it opens with the whole page fitted. */
  openZoom?: number;
  /** The page's zoom right now. */
  zoom: number;
  /** Zoomed away from the fitted page. */
  zoomed: boolean;
  onApplyPreset: (preset: ReadingPreset) => void;
  onThemeChange: (theme: ReaderTheme) => void;
  onBrightnessChange: (brightness: number) => void;
  /** Makes the zoom right now this book's own. */
  onSaveZoom: () => void;
  /** Back to fitting the whole page. */
  onClearZoom: () => void;
  onAutoHideControlsChange: (autoHideControls: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}

const READING_PRESETS: ReadingPreset[] = [
  {
    id: 'night',
    label: 'Night',
    description: 'Night + 15%',
    theme: 'dark',
    brightness: 85,
    icon: 'moon',
  },
  {
    id: 'paper',
    label: 'Warm',
    description: 'Sepia + 10%',
    theme: 'sepia',
    brightness: 90,
    icon: 'book',
  },
  {
    id: 'daylight',
    label: 'Daylight',
    description: 'Paper + 0%',
    theme: 'light',
    brightness: 100,
    icon: 'sun',
  },
  {
    id: 'focus',
    label: 'Focus',
    description: 'Contrast + 20%',
    theme: 'contrast',
    brightness: 80,
    icon: 'focus',
  },
];

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    label: 'Night',
    description: 'Best for night reading',
  },
  {
    id: 'light',
    label: 'Paper',
    description: 'Bright daylight reading',
  },
  {
    id: 'sepia',
    label: 'Sepia',
    description: 'Warm paper tone',
  },
  {
    id: 'contrast',
    label: 'Contrast',
    description: 'High contrast focus',
  },
];

function renderIcon(icon: ReadingPreset['icon']) {
  if (icon === 'moon') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 7.2 9 9 0 1 1-9-7.2Z" />
      </svg>
    );
  }

  if (icon === 'book') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z" />
      </svg>
    );
  }

  if (icon === 'sun') {
    return (
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

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <circle cx="12" cy="12" r="3" />
      <path d="m5 5 2.5 2.5" />
      <path d="m16.5 16.5 2.5 2.5" />
      <path d="m19 5-2.5 2.5" />
      <path d="m7.5 16.5-2.5 2.5" />
    </svg>
  );
}

const percent = (scale: number) => `${Math.round(scale * 100)}%`;

export function ReadingEnvironmentPanel({
  settings,
  openZoom,
  zoom,
  zoomed,
  onApplyPreset,
  onThemeChange,
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
        <h3 className="reading-environment__section-title">Quick Presets</h3>
        <div className="reading-environment__preset-grid">
          {READING_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.id}
              className="reading-environment__preset"
              onClick={() => onApplyPreset(preset)}
            >
              <span className="reading-environment__preset-icon">
                {renderIcon(preset.icon)}
              </span>
              <span className="reading-environment__preset-copy">
                <span className="reading-environment__preset-label">
                  {preset.label}
                </span>
                <span className="reading-environment__preset-description">
                  {preset.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="reading-environment__section">
        <h3 className="reading-environment__section-title">Themes</h3>
        <div className="reading-environment__theme-grid">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = settings.theme === theme.id;
            return (
              <button
                type="button"
                key={theme.id}
                className={`reading-environment__theme reading-environment__theme--${theme.id} ${isSelected ? 'reading-environment__theme--selected' : ''}`}
                onClick={() => onThemeChange(theme.id)}
                aria-pressed={isSelected}
              >
                <span className="reading-environment__theme-preview" aria-hidden="true">
                  <span className="reading-environment__theme-line reading-environment__theme-line--short" />
                  <span className="reading-environment__theme-line" />
                  <span className="reading-environment__theme-line reading-environment__theme-line--long" />
                </span>
                <span className="reading-environment__theme-copy">
                  <span className="reading-environment__theme-label">
                    {theme.label}
                  </span>
                  <span className="reading-environment__theme-description">
                    {theme.description}
                  </span>
                </span>
                <span className="reading-environment__theme-check" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
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
        <h3 className="reading-environment__section-title">Reading Behavior</h3>
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
          <p className="reading-environment__hint">Zoom with + or − until it reads well, then come back here to keep it for this book.</p>
        )}

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
