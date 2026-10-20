import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { syncStatusBar } from '@/features/appearance/palette';

/**
 * Android integration: keeps the status bar out of the web view, and maps the
 * hardware back button to closing an open reader panel, going back, or exiting.
 * Does nothing in a regular browser.
 */
export function useNativeApp(): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setOverlaysWebView({ overlay: false })
      .then(syncStatusBar) // the palette's background, icons that read on it
      .catch((err) => console.error('StatusBar plugin error:', err));

    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // Reader panels are <dialog>s that close on `cancel`, like Escape.
      const dialog = document.querySelector('dialog[open]');
      if (dialog) {
        dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
      } else if (canGoBack) {
        window.history.back();
      } else {
        void CapacitorApp.exitApp();
      }
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, []);
}
