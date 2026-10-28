import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

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
