import { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { PageWrapper } from '@/components/ui/PageWrapper/PageWrapper';
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
 * Settings: what is stored on this device, and the reader's keyboard shortcuts.
 * Theme and zoom are set from the reader itself and remembered per book.
 */
export function SettingsPage() {
  useDocumentTitle('Settings');

  const { books, isLoading } = useLibrary();
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);

  useEffect(() => {
    navigator.storage?.estimate().then(setEstimate).catch(() => setEstimate(null));
  }, [books.length]);

  const pdfBytes = books.reduce((sum, book) => sum + book.fileSize, 0);

  return (
    <PageWrapper
      title="Settings"
      description="Your library lives in this browser. Nothing is uploaded."
    >
      <div className="settings-sections">
        <section className="settings-section">
          <h2 className="settings-section__heading">Storage</h2>
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Books</span>
              <span className="settings-row__hint">PDFs imported into the library</span>
            </div>
            <span className="settings-row__value">
              {isLoading ? '…' : `${books.length} · ${formatBytes(pdfBytes)}`}
            </span>
          </div>
          {estimate?.usage !== undefined && estimate.quota !== undefined && (
            <div className="settings-row">
              <div className="settings-row__info">
                <span className="settings-row__label">Browser storage</span>
                <span className="settings-row__hint">
                  Used by Cloud Novel, out of what this browser allows
                </span>
              </div>
              <span className="settings-row__value">
                {formatBytes(estimate.usage)} of {formatBytes(estimate.quota)}
              </span>
            </div>
          )}
        </section>

        <section className="settings-section">
          <h2 className="settings-section__heading">Reader shortcuts</h2>
          {SHORTCUTS.map(([keys, action]) => (
            <div className="settings-row" key={keys}>
              <span className="settings-row__label">{action}</span>
              <kbd className="settings-row__kbd">{keys}</kbd>
            </div>
          ))}
        </section>
      </div>
    </PageWrapper>
  );
}
