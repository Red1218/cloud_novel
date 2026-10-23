import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PALETTES, getPalette, setPalette, type PaletteId } from '@/features/appearance/palette';
import {
  getDefaultFit,
  getReaderDefaults,
  setDefaultFit,
  setReaderDefaults,
} from '@/features/reader/hooks/useReaderEnvironment';
import type { ReaderOpeningMode, ReaderTheme } from '@/features/reader/types';
import './SettingsPage.css';

const SHORTCUTS: ReadonlyArray<[keys: string, action: string]> = [
  ['← / →', 'Previous / next page'],
  ['Ctrl + F', 'Search inside the book'],
  ['Ctrl + = / Ctrl + −', 'Zoom in / out'],
  ['Ctrl + 0', 'Reset zoom'],
  ['Esc', 'Close the open panel'],
];

const THEMES: ReadonlyArray<[ReaderTheme, string]> = [
  ['dark', 'Night'],
  ['light', 'Paper'],
  ['sepia', 'Sepia'],
  ['contrast', 'Contrast'],
];

const FITS: ReadonlyArray<[ReaderOpeningMode, string]> = [
  ['fit-width', 'Fit width'],
  ['fit-page', 'Whole page'],
];

function Swatches({ palette }: { palette: PaletteId }) {
  return (
    // Each swatch set reads its own palette's tokens
    <span className="settings__swatches" data-palette={palette} aria-hidden="true">
      <span style={{ background: 'var(--paper-bg)' }} />
      <span style={{ background: 'var(--shelf-1)' }} />
      <span style={{ background: 'var(--shelf-2)' }} />
      <span style={{ background: 'var(--shelf-3)' }} />
    </span>
  );
}

function Segmented<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: ReadonlyArray<[T, string]>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="settings__field">
      <span className="settings__label" id={`seg-${label}`}>{label}</span>
      <div className="settings__segmented" role="group" aria-labelledby={`seg-${label}`}>
        {options.map(([id, name]) => (
          <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Settings: how the app and books look. The palette, what new books open
 * with (each book keeps its own Aa changes after that), and keyboard shortcuts.
 */
export function SettingsPage() {
  useDocumentTitle('Settings');

  const [palette, choosePalette] = useState<PaletteId>(getPalette);
  const [defaults, setDefaults] = useState(getReaderDefaults);
  const [fit, setFit] = useState(getDefaultFit);
  const updateDefaults = (update: Partial<typeof defaults>) => {
    setReaderDefaults(update);
    setDefaults((current) => ({ ...current, ...update }));
  };

  return (
    <div className="settings paper-page">
      <h1 className="paper-title">Settings</h1>
      <p className="paper-meta">How new books open.</p>

      {PALETTES.length > 1 && (
      <details className="settings__section settings__palette-group">
        <summary className="settings__summary">
          <span className="settings__summary-text">
            <span className="settings__label">Palette</span>
            <span className="settings__value settings__palette-name">{PALETTES.find((p) => p.id === palette)?.name}</span>
          </span>
          <Swatches palette={palette} />
          <svg className="settings__chevron" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <fieldset className="settings__palettes" aria-label="Palette">
          {PALETTES.map(({ id, name }) => (
            <label key={id} className="settings__palette">
              <input
                type="radio"
                name="palette"
                checked={palette === id}
                onChange={() => {
                  choosePalette(id);
                  setPalette(id);
                }}
              />
              <Swatches palette={id} />
              <span className="settings__label">{name}</span>
            </label>
          ))}
        </fieldset>
      </details>
      )}

      <section className="settings__section settings__card" aria-labelledby="defaults-heading">
        <h2 id="defaults-heading" className="paper-eyebrow">New books open with</h2>
        <p className="settings__hint">Each book remembers its own Aa changes after that.</p>
        <Segmented label="Theme" options={THEMES} value={defaults.theme} onChange={(theme) => updateDefaults({ theme })} />
        <Segmented
          label="Page fit"
          options={FITS}
          value={fit}
          onChange={(mode) => {
            setDefaultFit(mode);
            setFit(mode);
          }}
        />
        <label className="settings__row settings__switch-row">
          <span className="settings__label">Hide controls while reading</span>
          <input
            type="checkbox"
            role="switch"
            className="paper-switch"
            checked={defaults.autoHideControls}
            onChange={(e) => updateDefaults({ autoHideControls: e.target.checked })}
          />
        </label>
      </section>

      <section className="settings__section settings__shortcuts" aria-labelledby="shortcuts-heading">
        <h2 id="shortcuts-heading" className="paper-eyebrow">Keyboard shortcuts</h2>
        {SHORTCUTS.map(([keys, action]) => (
          <div className="settings__row" key={keys}>
            <span className="settings__label">{action}</span>
            <kbd className="settings__kbd">{keys}</kbd>
          </div>
        ))}
      </section>
    </div>
  );
}
