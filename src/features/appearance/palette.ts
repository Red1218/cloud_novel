import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/** The shell's palettes; their colours live in tokens.css under [data-palette]. */
export const PALETTES = [
  { id: 'stillwater', name: 'Stillwater' },
  { id: 'stillwater-dark', name: 'Stillwater Dark' },
] as const;

export type PaletteId = (typeof PALETTES)[number]['id'];

const STORAGE_KEY = 'cloud-novel:palette';

export function getPalette(): PaletteId {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return PALETTES.find((p) => p.id === saved)?.id ?? 'stillwater';
  } catch {
    return 'stillwater';
  }
}

/** Shows a palette and remembers it on this device. */
export function setPalette(id: PaletteId): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage blocked: the palette still applies until the app closes.
  }
  applyPalette(id);
}

export function applyPalette(id: PaletteId): void {
  document.documentElement.dataset.palette = id;
  syncStatusBar();
}

/** Android: the status bar takes the shell's background, with icons that read on it. */
export function syncStatusBar(): void {
  if (!Capacitor.isNativePlatform()) return;
  const style = getComputedStyle(document.documentElement);
  const color = style.getPropertyValue('--paper-bg').trim();
  const dark = style.colorScheme === 'dark';
  StatusBar.setBackgroundColor({ color })
    .then(() => StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }))
    .catch((err) => console.error('StatusBar plugin error:', err));
}
