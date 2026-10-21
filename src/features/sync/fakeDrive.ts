import type { SyncService, SyncState } from './sync';

const STEP_MS = 400;

/**
 * Dev-only stand-in for Google Drive: signs in a sample account, "uploads"
 * with progress, and offers a few Drive books that aren't on this device.
 * `window.fakeDrive.failNext()` makes the next sync fail, to see the error state.
 */
export function createFakeDrive(signedOut: SyncState): SyncService {
  let state = signedOut;
  let failNext = false;
  const listeners = new Set<() => void>();
  const set = (patch: Partial<SyncState>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };
  const wait = () => new Promise((r) => setTimeout(r, STEP_MS));

  (window as unknown as { fakeDrive: object }).fakeDrive = { failNext: () => (failNext = true) };

  return {
    available: true,
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async signIn() {
      await wait();
      set({
        account: { name: 'Sample Reader', email: 'reader@example.com' },
        lastSynced: Date.now() - 2 * 60_000,
        driveBooks: [
          { hash: 'fake-1', title: 'The Moonstone', author: 'Wilkie Collins', fileSize: 21_000_000 },
          { hash: 'fake-2', title: 'Persuasion', author: 'Jane Austen', fileSize: 9_400_000 },
          { hash: 'fake-3', title: 'Kidnapped', author: 'R. L. Stevenson', fileSize: 14_800_000 },
        ],
      });
    },
    async signOut() {
      set(signedOut);
    },
    async backUp(books) {
      for (const [i, book] of books.entries()) {
        for (const part of [0, 0.5, 1]) {
          set({
            status: {
              kind: 'syncing',
              done: i,
              total: books.length,
              current: { title: book.title, sentBytes: book.fileSize * part, totalBytes: book.fileSize },
            },
          });
          await wait();
          if (failNext) {
            failNext = false;
            set({ status: { kind: 'error', waiting: books.length - i } });
            throw new Error("Couldn't reach Drive.");
          }
        }
        const { hash, title, author, fileSize, thumbnail } = book;
        set({ driveBooks: [...state.driveBooks, { hash, title, author, fileSize, thumbnail }] });
      }
      set({ status: { kind: 'synced' }, lastSynced: Date.now() });
    },
    async download(hashes) {
      await wait();
      // Nothing real to download: the books just leave the "not on this phone" list.
      set({ driveBooks: state.driveBooks.filter((b) => !hashes.includes(b.hash)) });
    },
    async deleteBackup() {
      await wait();
      set({ driveBooks: [] });
    },
    setOptions(options) {
      set(options);
    },
  };
}
