import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

/** Matches --paper-bg so the status bar blends into the app shell. */
const STATUS_BAR_COLOR = '#f2ede3';

/**
 * Android integration: keeps the status bar out of the web view, and maps the
 * hardware back button to closing an open reader panel, going back, or exiting.
 * Does nothing in a regular browser.
 */
export function useNativeApp(): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setOverlaysWebView({ overlay: false })
      .then(() => StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR }))
      .then(() => StatusBar.setStyle({ style: Style.Light })) // dark icons on paper
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
