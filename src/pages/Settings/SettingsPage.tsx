import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getReaderDefaults,
  setReaderDefaults,
} from '@/features/reader/hooks/useReaderEnvironment';
import './SettingsPage.css';

const SHORTCUTS: ReadonlyArray<[keys: string, action: string]> = [
  ['← / →', 'Previous / next page'],
  ['Ctrl + F', 'Search inside the book'],
  ['Ctrl + = / Ctrl + −', 'Zoom in / out'],
  ['Ctrl + 0', 'Reset zoom'],
  ['Esc', 'Close the open panel'],
];

/**
 * Settings: the controls new books open with (each keeps its own Aa
 * changes after that), and keyboard shortcuts.
 */
export function SettingsPage() {
  useDocumentTitle('Settings');

  const [defaults, setDefaults] = useState(getReaderDefaults);
  const updateDefaults = (update: Partial<typeof defaults>) => {
    setReaderDefaults(update);
    setDefaults((current) => ({ ...current, ...update }));
  };

  return (
    <div className="settings paper-page">
      <h1 className="paper-title">Settings</h1>
      <p className="paper-meta">How your books open.</p>

      <section className="settings__section settings__card" aria-labelledby="defaults-heading">
        <h2 id="defaults-heading" className="paper-eyebrow">New books open with</h2>
        <p className="settings__hint">Each book remembers its own Aa changes after that.</p>
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
