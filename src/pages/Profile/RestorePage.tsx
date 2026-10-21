import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { useToast } from '@/hooks/useToast';
import { compareWithDrive, syncService, useSync } from '@/features/sync/sync';
import { formatBytes } from '@/utils/formatBytes';
import { DriveCover, PageBar } from './ProfilePage';
import { plural, useBack } from './profileUtils';
import './ProfilePage.css';

/** "Choose books" from the profile: tick the Drive books to bring onto this device. */
export function RestorePage() {
  useDocumentTitle('Get books from Drive');
  const back = useBack(ROUTES.PROFILE);
  const { showToast } = useToast();
  const { books } = useLibrary();
  const { driveBooks } = useSync();
  const { missingHere } = compareWithDrive(books, driveBooks);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const chosen = missingHere.filter((b) => picked.has(b.hash));
  const size = formatBytes(chosen.reduce((sum, b) => sum + b.fileSize, 0));

  const toggle = (hash: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(hash)) next.add(hash);
      return next;
    });

  return (
    <div className="profile paper-page">
      <PageBar title="Get books from Drive" onBack={back} />

      {missingHere.length === 0 ? (
        <p className="profile__muted">Every book in your Drive is already on this phone.</p>
      ) : (
        <ul className="restore__list" role="list">
          {missingHere.map((b) => (
            <li key={b.hash}>
              <label className="restore__item">
                <input type="checkbox" checked={picked.has(b.hash)} onChange={() => toggle(b.hash)} />
                <DriveCover book={b} />
                <span className="restore__text">
                  <span className="profile__choice-title">{b.title}</span>
                  <span className="profile__card-meta">
                    {b.author ? `${b.author}, ` : ''}
                    {formatBytes(b.fileSize)}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {missingHere.length > 0 && (
        <div className="restore__footer">
          <button
            type="button"
            className="pill pill--filled restore__download"
            disabled={chosen.length === 0}
            onClick={() =>
              syncService
                .download(chosen.map((b) => b.hash))
                .then(back)
                .catch((err: Error) => showToast({ type: 'error', title: 'Google Drive', message: err.message }))
            }
          >
            {chosen.length === 0 ? 'Pick books to download' : `Download ${plural(chosen.length, 'book')}, ${size}`}
          </button>
        </div>
      )}
    </div>
  );
}
