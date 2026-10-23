import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ReaderEnvironmentSettings,
  ReaderOpeningMode,
  ReaderTheme,
} from '../types';

const STORAGE_KEY_PREFIX = 'cloud-novel:reader-environment';
/** Settings' "New books open with": books with no saved settings start from these. */
const DEFAULTS_KEY = `${STORAGE_KEY_PREFIX}:global`;
const DEFAULT_FIT_KEY = 'cloud-novel:reader-default-fit';
const DEFAULT_ZOOM_KEY = 'cloud-novel:reader-default-zoom';
const BRIGHTNESS_MIN = 0;
const BRIGHTNESS_MAX = 100;

export const DEFAULT_READER_ENVIRONMENT: ReaderEnvironmentSettings = {
  theme: 'dark',
  brightness: 100,
  autoHideControls: true,
};

export interface ReaderEnvironmentUpdate {
  theme?: ReaderTheme;
  brightness?: number;
  autoHideControls?: boolean;
}

export interface UseReaderEnvironmentResult {
  settings: ReaderEnvironmentSettings;
  dimOpacity: number;
  updateSettings: (update: ReaderEnvironmentUpdate) => void;
  resetSettings: () => void;
}

function clampBrightness(value: number): number {
  return Math.min(BRIGHTNESS_MAX, Math.max(BRIGHTNESS_MIN, Math.round(value)));
}

function isReaderTheme(value: unknown): value is ReaderTheme {
  return value === 'dark'
    || value === 'light'
    || value === 'sepia'
    || value === 'contrast';
}

function getStorageKey(bookId: string | undefined): string {
  return `${STORAGE_KEY_PREFIX}:${bookId ?? 'global'}`;
}

function readSettings(storageKey: string): ReaderEnvironmentSettings {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return storageKey === DEFAULTS_KEY ? DEFAULT_READER_ENVIRONMENT : readSettings(DEFAULTS_KEY);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReaderEnvironmentSettings>;
    return {
      theme: isReaderTheme(parsed.theme)
        ? parsed.theme
        : DEFAULT_READER_ENVIRONMENT.theme,
      brightness: typeof parsed.brightness === 'number'
        ? clampBrightness(parsed.brightness)
        : DEFAULT_READER_ENVIRONMENT.brightness,
      autoHideControls: typeof parsed.autoHideControls === 'boolean'
        ? parsed.autoHideControls
        : DEFAULT_READER_ENVIRONMENT.autoHideControls,
    };
  } catch {
    return DEFAULT_READER_ENVIRONMENT;
  }
}

function writeSettings(storageKey: string, settings: ReaderEnvironmentSettings): void {
  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}

export function getReaderDefaults(): ReaderEnvironmentSettings {
  return readSettings(DEFAULTS_KEY);
}

export function setReaderDefaults(update: ReaderEnvironmentUpdate): void {
  writeSettings(DEFAULTS_KEY, { ...getReaderDefaults(), ...update });
}

/** How every book opens: fitted, or at the default zoom ('custom'). */
export type DefaultFit = ReaderOpeningMode | 'custom';

export function getDefaultFit(): DefaultFit {
  const saved = window.localStorage.getItem(DEFAULT_FIT_KEY);
  return saved === 'fit-page' || saved === 'custom' ? saved : 'fit-width';
}

export function setDefaultFit(mode: DefaultFit): void {
  window.localStorage.setItem(DEFAULT_FIT_KEY, mode);
}

/** The default zoom, in percent, used when the default fit is 'custom'. */
export function getDefaultZoom(): number {
  const saved = Number(window.localStorage.getItem(DEFAULT_ZOOM_KEY));
  return saved >= 25 && saved <= 500 ? Math.round(saved) : 100;
}

export function setDefaultZoom(percent: number): void {
  window.localStorage.setItem(DEFAULT_ZOOM_KEY, String(Math.min(500, Math.max(25, Math.round(percent)))));
}

/**
 * Owns per-book Reading Environment settings.
 *
 * These settings affect only the reader environment around the PDF page.
 * The hook does not know about PDF rendering and never touches canvas state.
 */
export function useReaderEnvironment(
  bookId: string | undefined,
): UseReaderEnvironmentResult {
  const storageKey = useMemo(() => getStorageKey(bookId), [bookId]);
  const [settings, setSettings] = useState<ReaderEnvironmentSettings>(() => (
    readSettings(storageKey)
  ));

  useEffect(() => {
    setSettings(readSettings(storageKey));
  }, [storageKey]);

  const updateSettings = useCallback((update: ReaderEnvironmentUpdate): void => {
    setSettings((current) => {
      const next: ReaderEnvironmentSettings = {
        ...current,
        ...update,
        brightness: update.brightness !== undefined
          ? clampBrightness(update.brightness)
          : current.brightness,
      };

      writeSettings(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const resetSettings = useCallback((): void => {
    writeSettings(storageKey, DEFAULT_READER_ENVIRONMENT);
    setSettings(DEFAULT_READER_ENVIRONMENT);
  }, [storageKey]);

  const dimOpacity = useMemo(() => {
    const dimAmount = (BRIGHTNESS_MAX - settings.brightness) / BRIGHTNESS_MAX;
    return Math.round(dimAmount * 0.72 * 100) / 100;
  }, [settings.brightness]);

  return {
    settings,
    dimOpacity,
    updateSettings,
    resetSettings,
  };
}
