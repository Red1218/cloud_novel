import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ReaderEnvironmentSettings,
  ReaderTheme,
} from '../types';

const STORAGE_KEY_PREFIX = 'cloud-novel:reader-environment';
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
  if (typeof window === 'undefined') {
    return DEFAULT_READER_ENVIRONMENT;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return DEFAULT_READER_ENVIRONMENT;
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
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(settings));
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
