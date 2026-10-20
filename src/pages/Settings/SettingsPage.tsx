import { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { PALETTES, getPalette, setPalette, type PaletteId } from '@/features/appearance/palette';
import './SettingsPage.css';

const SHORTCUTS: ReadonlyArray<[keys: string, action: string]> = [
  ['← / →', 'Previous / next page'],
  ['Ctrl + F', 'Search inside the book'],
  ['Ctrl + = / Ctrl + −', 'Zoom in / out'],
  ['Ctrl + 0', 'Reset zoom'],
  ['Esc', 'Close the open panel'],
];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

/**
 * Settings: the shell's palette, what is stored on this device, and (with a
 * keyboard) the reader's shortcuts. Theme, brightness and fit live under Aa in the reader.
 */
export function SettingsPage() {
  useDocumentTitle('Settings');

  const { books, isLoading } = useLibrary();
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [palette, choosePalette] = useState<PaletteId>(getPalette);

  useEffect(() => {
    navigator.storage?.estimate().then(setEstimate).catch(() => setEstimate(null));
  }, [books.length]);

  const pdfBytes = books.reduce((sum, book) => sum + book.fileSize, 0);
  const usage = estimate?.usage;
  const quota = estimate?.quota;

  return (
    <div className="settings paper-page">
      <h1 className="paper-title">Settings</h1>
      <p className="paper-meta">Your library lives on this device. Nothing is uploaded.</p>

      <fieldset className="settings__section settings__palettes">
        <legend className="paper-eyebrow">Palette</legend>
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
            {/* Each swatch set reads its own palette's tokens */}
            <span className="settings__swatches" data-palette={id} aria-hidden="true">
              <span style={{ background: 'var(--paper-bg)' }} />
              <span style={{ background: 'var(--shelf-1)' }} />
              <span style={{ background: 'var(--shelf-2)' }} />
              <span style={{ background: 'var(--shelf-3)' }} />
            </span>
            <span className="settings__label">{name}</span>
          </label>
        ))}
      </fieldset>

      <section className="settings__section" aria-labelledby="device-heading">
        <h2 id="device-heading" className="paper-eyebrow">On this device</h2>
        <div className="settings__row">
          <span className="settings__label">Books</span>
          <span className="settings__value">
            {isLoading ? '…' : `${books.length} · ${formatBytes(pdfBytes)}`}
          </span>
        </div>
        {usage !== undefined && quota !== undefined && quota > 0 && (
          <div className="settings__row settings__row--stacked">
            <div className="settings__row-head">
              <span className="settings__label">Space used</span>
              <span className="settings__value">
                {formatBytes(usage)} of {formatBytes(quota)}
              </span>
            </div>
            <div className="paper-progress__bar" aria-hidden="true">
              <div style={{ width: `${Math.max(1, Math.round((usage / quota) * 100))}%` }} />
            </div>
          </div>
        )}
      </section>

      <section className="settings__section settings__shortcuts" aria-labelledby="shortcuts-heading">
        <h2 id="shortcuts-heading" className="paper-eyebrow">Reader shortcuts</h2>
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
