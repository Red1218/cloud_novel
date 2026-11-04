import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getAppSettings, setAppSettings, type AppReaderSettings } from '@/features/reader/hooks/useReaderEnvironment';
import { ZOOM_MIN } from '@/features/reader/constants';
import './SettingsPage.css';

const SHORTCUTS: ReadonlyArray<[keys: string, action: string]> = [
  ['← / →', 'Previous / next page'],
  ['Ctrl + F', 'Search inside the book'],
  ['Ctrl + = / Ctrl + −', 'Zoom in / out'],
  ['Ctrl + 0', 'Reset zoom'],
  ['Esc', 'Close the open panel'],
];

/** The zoom a book opens at when you first turn off "Fit the whole page". */
const FIRST_ZOOM = 1;
/** Same range as the zoom bar in a book's Aa panel. */
const ZOOM_MAX = 3;

/**
 * Settings: how every book reads (opening zoom, brightness, controls) and
 * keyboard shortcuts. A book follows these until you change one of them in
 * its own Aa panel.
 */
export function SettingsPage() {
  useDocumentTitle('Settings');

  const [app, setApp] = useState(getAppSettings);
  const update = (change: Partial<AppReaderSettings>) => {
    setAppSettings(change);
    setApp(getAppSettings());
  };
  const zoom = Math.round((app.openZoom ?? FIRST_ZOOM) * 100);

  return (
    <div className="settings paper-page">
      <h1 className="paper-title">Settings</h1>
      <p className="paper-meta">How every book reads. Change one in a book's Aa panel and that book keeps its own.</p>

      <section className="settings__section settings__card" aria-labelledby="reading-heading">
        <h2 id="reading-heading" className="paper-eyebrow">Reading</h2>

        <label className="settings__row settings__switch-row">
          <span className="settings__label">Fit the whole page</span>
          <input
            type="checkbox"
            role="switch"
            className="paper-switch"
            checked={app.openZoom === undefined}
            onChange={(e) => update({ openZoom: e.target.checked ? undefined : FIRST_ZOOM })}
          />
        </label>
        {app.openZoom !== undefined && (
          <label className="settings__slider">
            <span className="settings__slider-head">
              <span className="settings__label">Opening zoom</span>
              <span className="settings__value">{zoom}%</span>
            </span>
            <input
              type="range"
              min={ZOOM_MIN * 100}
              max={ZOOM_MAX * 100}
              step="5"
              value={zoom}
              onChange={(e) => update({ openZoom: e.target.valueAsNumber / 100 })}
            />
          </label>
        )}

        <label className="settings__slider">
          <span className="settings__slider-head">
            <span className="settings__label">Brightness</span>
            <span className="settings__value">{app.brightness}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={app.brightness}
            onChange={(e) => update({ brightness: e.target.valueAsNumber })}
          />
        </label>

        <label className="settings__row settings__switch-row">
          <span className="settings__label">Hide controls while reading</span>
          <input
            type="checkbox"
            role="switch"
            className="paper-switch"
            checked={app.autoHideControls}
            onChange={(e) => update({ autoHideControls: e.target.checked })}
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
