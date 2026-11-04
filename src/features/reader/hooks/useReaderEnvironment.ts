import { useCallback, useEffect, useState } from 'react';
import type { ReaderEnvironmentSettings } from '../types';

/** App-wide settings (the Settings page); every book follows them. */
const APP_KEY = 'cloud-novel:reader-environment:global';
/** What one book changed in its Aa panel, and nothing else. */
const BOOK_PREFIX = 'cloud-novel:reader-overrides:';
/** Before overrides, each book kept a full copy of every setting here. */
const OLD_BOOK_PREFIX = 'cloud-novel:reader-environment:';
const BRIGHTNESS_MIN = 0;
const BRIGHTNESS_MAX = 100;

export interface AppReaderSettings extends ReaderEnvironmentSettings {
  /** The zoom books open at (1 = 100%); undefined fits the whole page. */
  openZoom?: number;
}

export const DEFAULT_READER_ENVIRONMENT: AppReaderSettings = {
  brightness: 100,
  autoHideControls: true,
};

export type ReaderEnvironmentUpdate = Partial<ReaderEnvironmentSettings>;

export interface UseReaderEnvironmentResult {
  /** The book's own changes over the app settings. */
  settings: ReaderEnvironmentSettings;
  /** Which settings this book changed itself. */
  own: ReaderEnvironmentUpdate;
  /** The app-wide opening zoom; the book's own lives on the book (openZoom). */
  appOpenZoom?: number;
  dimOpacity: number;
  updateSettings: (update: ReaderEnvironmentUpdate) => void;
  /** Forget this book's changes so it follows the app settings again. */
  resetSettings: () => void;
}

function clampBrightness(value: number): number {
  return Math.min(BRIGHTNESS_MAX, Math.max(BRIGHTNESS_MIN, Math.round(value)));
}

/** Only the valid fields of a stored object, so a bad value never wins over a good default. */
function clean(raw: string | null): Partial<AppReaderSettings> {
  try {
    const parsed = JSON.parse(raw ?? '{}') as Partial<AppReaderSettings>;
    const out: Partial<AppReaderSettings> = {};
    if (typeof parsed.brightness === 'number') out.brightness = clampBrightness(parsed.brightness);
    if (typeof parsed.autoHideControls === 'boolean') out.autoHideControls = parsed.autoHideControls;
    if (typeof parsed.openZoom === 'number' && parsed.openZoom > 0) out.openZoom = parsed.openZoom;
    return out;
  } catch {
    return {};
  }
}

export function getAppSettings(): AppReaderSettings {
  return { ...DEFAULT_READER_ENVIRONMENT, ...clean(window.localStorage.getItem(APP_KEY)) };
}

/** `openZoom: undefined` goes back to fitting the whole page. */
export function setAppSettings(update: Partial<AppReaderSettings>): void {
  const next = { ...getAppSettings(), ...update };
  if (next.brightness !== undefined) next.brightness = clampBrightness(next.brightness);
  window.localStorage.setItem(APP_KEY, JSON.stringify(next));
}

/** One-time clean-up: the old full per-book copies would hide the app settings forever. */
export function forgetOldBookSettings(): void {
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith(OLD_BOOK_PREFIX) && key !== APP_KEY) window.localStorage.removeItem(key);
  }
}

/**
 * A book's reading settings: the app settings, with whatever the book
 * changed in its Aa panel on top. The hook never touches canvas state.
 */
export function useReaderEnvironment(
  bookId: string | undefined,
): UseReaderEnvironmentResult {
  const key = `${BOOK_PREFIX}${bookId ?? ''}`;
  const [app] = useState(getAppSettings);
  const [own, setOwn] = useState<ReaderEnvironmentUpdate>(() => clean(window.localStorage.getItem(key)));

  useEffect(() => {
    setOwn(clean(window.localStorage.getItem(key)));
  }, [key]);

  const updateSettings = useCallback((update: ReaderEnvironmentUpdate): void => {
    setOwn((current) => {
      const next = { ...current, ...update };
      if (next.brightness !== undefined) next.brightness = clampBrightness(next.brightness);
      if (bookId) window.localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [bookId, key]);

  const resetSettings = useCallback((): void => {
    window.localStorage.removeItem(key);
    setOwn({});
  }, [key]);

  const settings: ReaderEnvironmentSettings = {
    brightness: own.brightness ?? app.brightness,
    autoHideControls: own.autoHideControls ?? app.autoHideControls,
  };

  return {
    settings,
    own,
    appOpenZoom: app.openZoom,
    dimOpacity: dimFor(settings.brightness),
    updateSettings,
    resetSettings,
  };
}

/** Brightness 100 → no veil; 0 → a 72% black veil over the page. */
function dimFor(brightness: number): number {
  return Math.round(((BRIGHTNESS_MAX - brightness) / BRIGHTNESS_MAX) * 0.72 * 100) / 100;
}
