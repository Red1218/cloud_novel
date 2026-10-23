import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '@/types/book';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLibrary } from '@/hooks/useLibrary';
import { useToast } from '@/hooks/useToast';
import { BookCover } from '@/components/library/BookCover/BookCover';
import { Avatar } from '@/components/layout/ProfileButton/ProfileButton';
import { compareWithDrive, syncService, useSync, type DriveBook, type SyncState } from '@/features/sync/sync';
import { formatRelativeTime } from '@/features/library/utils/formatRelativeTime';
import { formatBytes } from '@/utils/formatBytes';
import '@/components/library/BookCollectionsSheet/BookCollectionsSheet.css';
import '@/pages/Settings/SettingsPage.css';
import { plural, useBack } from './profileUtils';
import './ProfilePage.css';

const RESTORE_COVERS_MAX = 5;

const totalSize = (books: readonly { fileSize: number }[]) => formatBytes(books.reduce((sum, b) => sum + b.fileSize, 0));

/** A Drive book's cover; without one, its first letter (a title would clip at this size). */
export function DriveCover({ book }: { book: DriveBook }) {
  return (
    <span className="profile__cover">
      {book.thumbnail ? (
        <BookCover src={book.thumbnail} title={book.title} />
      ) : (
        <span className="profile__cover-letter" aria-hidden="true">{book.title.trim()[0]?.toUpperCase()}</span>
      )}
    </span>
  );
}

export function PageBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="profile__bar">
      <button type="button" className="profile__back" onClick={onBack} aria-label="Back">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>
      <h1 className="profile__bar-title">{title}</h1>
    </header>
  );
}

/**
 * Profile: the Google account, Drive backup and restore, and sign out.
 * Opened from the top-right button on Home and Library.
 */
export function ProfilePage() {
  useDocumentTitle('Profile');
  const back = useBack(ROUTES.DASHBOARD);
  const { showToast } = useToast();
  const { books, isLoading } = useLibrary();
  const sync = useSync();
  const [dialog, setDialog] = useState<'sign-out' | 'delete' | 'first-sync' | null>(null);
  const { backedUp, notBackedUp, missingHere } = compareWithDrive(books, sync.driveBooks);

  const run = (task: Promise<void>) =>
    task.catch((err: Error) => showToast({ type: 'error', title: 'Google Drive', message: err.message }));
  const signIn = () =>
    run(syncService.signIn().then(() => {
      if (books.length > 0) setDialog('first-sync');
    }));

  return (
    <div className="profile paper-page">
      <PageBar title="Profile" onBack={back} />

      {sync.account ? (
        <>
          <div className="profile__account">
            <Avatar account={sync.account} size={64} />
            <div className="profile__who">
              <p className="profile__name">{sync.account.name}</p>
              <p className="profile__email">{sync.account.email}</p>
            </div>
          </div>
          <StatusCard sync={sync} backedUp={backedUp.length} total={books.length} onSync={() => syncService.backUp(notBackedUp).catch(() => {}) /* the card shows the error */} />
        </>
      ) : (
        <section className="profile__intro" aria-labelledby="intro-heading">
          <span className="orb" aria-hidden="true" />
          <span className="profile__person" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="8.5" r="3.5" />
              <path d="M5 19.5c1.2-3.2 3.8-5 7-5s5.8 1.8 7 5" />
            </svg>
          </span>
          <h2 id="intro-heading" className="profile__intro-title">Keep your books safe in Google Drive</h2>
          <p className="profile__intro-body">Back up your books to your Google Drive and get them back on a new device.</p>
          <GoogleButton onClick={signIn} />
          <p className="profile__muted">Your library stays on this device until you sign in.</p>
        </section>
      )}

      <section className="profile__section profile__storage" aria-labelledby="storage-heading">
        <h2 id="storage-heading" className="paper-eyebrow">Storage</h2>
        <div className="settings__row">
          <span className="settings__label">On this phone</span>
          <span className="settings__value">{isLoading ? '…' : books.length === 0 ? 'No books yet' : `${plural(books.length, 'book')}, ${totalSize(books)}`}</span>
        </div>
        <div className="settings__row">
          <span className="settings__label">In Google Drive</span>
          <span className="settings__value">
            {sync.account ? `${plural(sync.driveBooks.length, 'book')}, ${totalSize(sync.driveBooks)}` : 'Not backed up'}
          </span>
        </div>
        {sync.account && books.length > 0 && (
          <div className="paper-progress profile__backed-up">
            <div className="paper-progress__bar" aria-hidden="true">
              <div style={{ width: `${Math.round((backedUp.length / books.length) * 100)}%` }} />
            </div>
            <span className="paper-progress__label">{Math.round((backedUp.length / books.length) * 100)}% backed up</span>
          </div>
        )}
      </section>

      {sync.account && missingHere.length > 0 && (
        <section className="profile__card profile__restore" aria-labelledby="restore-heading">
          <h2 id="restore-heading" className="profile__card-title">
            {missingHere.length === 1 ? "1 book in your Drive isn't" : `${missingHere.length} books in your Drive aren't`} on this phone
          </h2>
          <div className="profile__covers" aria-hidden="true">
            {missingHere.slice(0, RESTORE_COVERS_MAX).map((b) => (
              <DriveCover key={b.hash} book={b} />
            ))}
          </div>
          <div className="profile__actions">
            <button type="button" className="pill pill--filled" onClick={() => run(syncService.download(missingHere.map((b) => b.hash)))}>
              Download all
            </button>
            <Link to={ROUTES.PROFILE_RESTORE} className="pill pill--outline">Choose books</Link>
          </div>
        </section>
      )}

      {sync.account && (
        <>
          <section className="profile__section" aria-labelledby="sync-heading">
            <h2 id="sync-heading" className="paper-eyebrow">Sync</h2>
            <SwitchRow label="Back up new books on their own" checked={sync.autoBackup} onChange={(autoBackup) => syncService.setOptions({ autoBackup })} />
            <SwitchRow label="Only on Wi-Fi" checked={sync.wifiOnly} onChange={(wifiOnly) => syncService.setOptions({ wifiOnly })} />
          </section>

          <section className="profile__section" aria-labelledby="account-heading">
            <h2 id="account-heading" className="paper-eyebrow">Account</h2>
            <button type="button" className="settings__row profile__row-button" onClick={() => setDialog('sign-out')}>
              <span className="settings__label">Sign out</span>
            </button>
            <button type="button" className="settings__row profile__row-button profile__danger" onClick={() => setDialog('delete')}>
              <span className="settings__label">Delete my Drive backup</span>
            </button>
            <p className="profile__muted profile__note">
              Deleting the backup removes your books from Google Drive. Books on this phone stay.
            </p>
          </section>
        </>
      )}

      {dialog === 'sign-out' && (
        <ConfirmDialog
          title="Sign out of Google?"
          confirmLabel="Sign out"
          onConfirm={() => run(syncService.signOut())}
          onClose={() => setDialog(null)}
        >
          Your books stay on this device. Syncing stops until you sign in again.
        </ConfirmDialog>
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          title="Delete your Drive backup?"
          confirmLabel="Delete backup"
          danger
          onConfirm={() => run(syncService.deleteBackup())}
          onClose={() => setDialog(null)}
        >
          This removes {plural(sync.driveBooks.length, 'book')} ({totalSize(sync.driveBooks)}) from your Google Drive. Books on this phone stay. You can't undo this.
        </ConfirmDialog>
      )}
      {dialog === 'first-sync' && sync.account && (
        <FirstSyncSheet
          email={sync.account.email}
          books={notBackedUp}
          wifiOnly={sync.wifiOnly}
          onBackUp={(picked) => run(syncService.backUp(picked))}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

function StatusCard({ sync, backedUp, total, onSync }: { sync: SyncState; backedUp: number; total: number; onSync: () => void }) {
  const { status } = sync;
  const lastSynced = formatRelativeTime(sync.lastSynced);

  if (status.kind === 'error') {
    return (
      <button type="button" className="profile__card profile__status profile__status--error" onClick={onSync}>
        <span className="profile__card-title">Couldn't reach Drive, tap to retry</span>
        <span className="profile__card-meta">
          {lastSynced ? `Last synced ${lastSynced}. ` : ''}
          {plural(status.waiting, 'book')} waiting.
        </span>
      </button>
    );
  }

  if (status.kind === 'syncing') {
    const { done, total: count, current } = status;
    const percent = Math.round(((done + current.sentBytes / current.totalBytes) / count) * 100);
    return (
      <section className="profile__card profile__status" aria-live="polite">
        <p className="profile__card-title">Uploading {done + 1} of {count}</p>
        <p className="profile__card-meta">
          {current.title}, {Math.round(current.sentBytes / 1024 ** 2)} of {formatBytes(current.totalBytes)}
        </p>
        <div className="paper-progress__bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <div style={{ width: `${percent}%` }} />
        </div>
        <p className="profile__muted">You can keep reading. Upload pauses off Wi-Fi.</p>
      </section>
    );
  }

  return (
    <section className="profile__card profile__status">
      <p className="profile__card-title">{lastSynced ? `Synced ${lastSynced}` : 'Not synced yet'}</p>
      <p className="profile__card-meta">{total === 0 ? 'Nothing to back up yet' : `${backedUp} of ${plural(total, 'book')} backed up`}</p>
      <button type="button" className="pill pill--outline profile__sync-now" onClick={onSync}>Sync now</button>
    </section>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="settings__row profile__switch-row">
      <span className="settings__label">{label}</span>
      <input type="checkbox" role="switch" className="paper-switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/** Google's "Sign in with Google" button: their logo and wording, per their branding rules. */
function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="google-button" onClick={onClick}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      Sign in with Google
    </button>
  );
}

/** A modal <dialog> that closes on Escape, the back button or a tap outside. */
function Sheet({ labelledBy, onClose, children }: { labelledBy: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);
  return (
    <dialog
      ref={ref}
      className="collections-sheet"
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="collections-sheet__panel">
        <span className="collections-sheet__handle" aria-hidden="true" />
        {children}
      </div>
    </dialog>
  );
}

interface ConfirmDialogProps {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Red, and the confirm button waits until "delete" is typed. */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDialog({ title, children, confirmLabel, danger, onConfirm, onClose }: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const ready = !danger || typed.trim().toLowerCase() === 'delete';
  return (
    <Sheet labelledBy="confirm-title" onClose={onClose}>
      <div>
        <h2 id="confirm-title" className="collections-sheet__title">{title}</h2>
        <p className="profile__dialog-body">{children}</p>
      </div>
      {danger && (
        <label className="profile__type-to-confirm">
          Type delete to confirm
          <input className="collections-sheet__input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="off" />
        </label>
      )}
      <div className="profile__actions">
        <button
          type="button"
          className={`pill pill--filled${danger ? ' profile__danger-fill' : ''}`}
          disabled={!ready}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
        <button type="button" className="pill pill--outline" onClick={onClose}>Cancel</button>
      </div>
    </Sheet>
  );
}

interface FirstSyncSheetProps {
  email: string;
  /** Books on this phone that aren't in Drive yet. */
  books: readonly Book[];
  wifiOnly: boolean;
  onBackUp: (books: readonly Book[]) => void;
  onClose: () => void;
}

/** Right after sign-in: back everything up now, pick books, or wait. */
function FirstSyncSheet({ email, books, wifiOnly, onBackUp, onClose }: FirstSyncSheetProps) {
  const [mode, setMode] = useState<'all' | 'pick'>('all');
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const chosen = mode === 'all' ? books : books.filter((b) => picked.has(b.id));
  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <Sheet labelledBy="first-sync-title" onClose={onClose}>
      <div>
        <h2 id="first-sync-title" className="collections-sheet__title">Back up your books</h2>
        <p className="collections-sheet__subtitle">Signed in as {email}</p>
      </div>

      <fieldset className="collections-sheet__group" aria-label="What to back up">
        <label className="profile__choice">
          <input type="radio" name="first-sync" checked={mode === 'all'} onChange={() => setMode('all')} />
          <span>
            <span className="profile__choice-title">Everything now</span>
            <span className="profile__card-meta">{plural(books.length, 'book')}, {totalSize(books)}</span>
          </span>
        </label>
        <label className="profile__choice">
          <input type="radio" name="first-sync" checked={mode === 'pick'} onChange={() => setMode('pick')} />
          <span>
            <span className="profile__choice-title">Pick books</span>
            <span className="profile__card-meta">Choose which ones go to Drive</span>
          </span>
        </label>
      </fieldset>

      {mode === 'pick' && (
        <div className="collections-sheet__group">
          {books.map((b) => (
            <label key={b.id} className="collections-sheet__option">
              <input type="checkbox" checked={picked.has(b.id)} onChange={() => toggle(b.id)} />
              <span className="profile__pick-title">{b.title}</span>
              <span className="collections-sheet__option-meta">{formatBytes(b.fileSize)}</span>
            </label>
          ))}
        </div>
      )}

      <SwitchRow label="Only on Wi-Fi" checked={wifiOnly} onChange={(on) => syncService.setOptions({ wifiOnly: on })} />

      <div className="profile__actions">
        <button
          type="button"
          className="pill pill--filled"
          disabled={chosen.length === 0}
          onClick={() => {
            onBackUp(chosen);
            onClose();
          }}
        >
          Back up {plural(chosen.length, 'book')}
        </button>
        <button type="button" className="pill pill--outline" onClick={onClose}>Not now</button>
      </div>
    </Sheet>
  );
}
