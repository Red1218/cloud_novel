import { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
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
 * Settings: what is stored on this device, and (with a keyboard) the
 * reader's shortcuts. Theme, brightness and fit live under Aa in the reader.
 */
export function SettingsPage() {
  useDocumentTitle('Settings');

  const { books, isLoading } = useLibrary();
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);

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
