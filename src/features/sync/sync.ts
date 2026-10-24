import { useSyncExternalStore } from 'react';
import type { Book } from '@/types/book';
import { createFakeDrive } from './fakeDrive';
import type { ToastMessage } from '@/types/toast';

export interface DriveAccount {
  name: string;
  email: string;
  photoUrl?: string;
}

/** A book in the Drive backup. Matched to local books by file hash, since ids differ per device. */
export interface DriveBook {
  hash: string;
  title: string;
  author?: string;
  fileSize: number;
  thumbnail?: string;
}

export type SyncStatus =
  | { kind: 'synced' }
  | { kind: 'syncing'; done: number; total: number; current: { title: string; sentBytes: number; totalBytes: number } }
  | { kind: 'error'; waiting: number };

export interface SyncState {
  account: DriveAccount | null;
  status: SyncStatus;
  lastSynced?: number;
  driveBooks: readonly DriveBook[];
  autoBackup: boolean;
  wifiOnly: boolean;
}

export interface SyncService {
  /** False until a Google OAuth client is set up for the app. */
  readonly available: boolean;
  getState(): SyncState;
  subscribe(listener: () => void): () => void;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  /** Uploads these local books (the ones not in Drive yet are the caller's pick). */
  backUp(books: readonly Book[]): Promise<void>;
  download(hashes: readonly string[]): Promise<void>;
  deleteBackup(): Promise<void>;
  setOptions(options: Partial<Pick<SyncState, 'autoBackup' | 'wifiOnly'>>): void;
}

const SIGNED_OUT: SyncState = {
  account: null,
  status: { kind: 'synced' },
  driveBooks: [],
  autoBackup: true,
  wifiOnly: true,
};

const NOT_SET_UP = "Google sign-in isn't set up for this app yet.";
const notSetUp = () => Promise.reject(new Error(NOT_SET_UP));

/**
 * The toast for a failed Drive task: `failed` names what failed, the error
 * says how to fix it. "Not set up yet" is news, not a failure.
 */
export function driveErrorToast(err: Error, failed: string): Omit<ToastMessage, 'id'> {
  return err.message === NOT_SET_UP
    ? { type: 'info', title: "Google sign-in isn't set up yet" }
    : { type: 'error', title: failed, message: err.message || 'Check your connection and try again.' };
}

/** Stands in until the Google Drive client exists: always signed out. */
const unavailable: SyncService = {
  available: false,
  getState: () => SIGNED_OUT,
  subscribe: () => () => {},
  signIn: notSetUp,
  signOut: notSetUp,
  backUp: notSetUp,
  download: notSetUp,
  deleteBackup: notSetUp,
  setOptions: () => {},
};

// ponytail: dev builds use an in-memory fake Drive so every state can be seen;
// swap `unavailable` for the real Drive client once the OAuth client exists.
export const syncService: SyncService = import.meta.env.DEV ? createFakeDrive(SIGNED_OUT) : unavailable;

export function useSync(): SyncState {
  return useSyncExternalStore(syncService.subscribe, syncService.getState);
}

/** Local books split by whether Drive has them, and Drive books missing here. */
export function compareWithDrive(books: readonly Book[], driveBooks: readonly DriveBook[]) {
  const inDrive = new Set(driveBooks.map((b) => b.hash));
  const onPhone = new Set(books.map((b) => b.hash));
  return {
    backedUp: books.filter((b) => inDrive.has(b.hash)),
    notBackedUp: books.filter((b) => !inDrive.has(b.hash)),
    missingHere: driveBooks.filter((b) => !onPhone.has(b.hash)),
  };
}
